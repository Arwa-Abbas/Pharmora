#include <iostream>
#include <vector>
#include <set>
#include <algorithm>
#include <cmath>
using namespace std;

struct User {
    set<int> rated_items;
};

double cosine_similarity(const vector<double>& a, const vector<double>& b) {
    double dot = 0, norm_a = 0, norm_b = 0;
    for (size_t i = 0; i < a.size(); i++) {
        dot += a[i] * b[i];
        norm_a += a[i] * a[i];
        norm_b += b[i] * b[i];
    }
    if (norm_a == 0 || norm_b == 0) return 0.0;
    return dot / (sqrt(norm_a) * sqrt(norm_b));
}

double rank_according_to_nearest_neighbors(int k, int u, int item, const vector<vector<double>>& R) {
    vector<pair<double, int>> similarities;
    for (int other = 0; other < (int)R.size(); other++) {
        if (other != u && R[other][item] > 0) {
            double sim = cosine_similarity(R[u], R[other]);
            similarities.push_back({sim, other});
        }
    }
    sort(similarities.begin(), similarities.end(),
         [](const pair<double,int>& a, const pair<double,int>& b) {
             return a.first > b.first;
         });
    double score = 0;
    int count = 0;
    for (int i = 0; i < k && i < (int)similarities.size(); i++) {
        int neighbor = similarities[i].second;
        score += similarities[i].first * R[neighbor][item];
        count++;
    }
    if (count == 0) return 0.0;
    return score / count;
}

vector<int> recommend_items(int N, int k, int u, 
                            const vector<int>& all_items, 
                            const vector<vector<double>>& R, 
                            const User& usr) 
{
    vector<pair<double, int>> scored_items;
    for (int item : all_items) {
        if (usr.rated_items.find(item) == usr.rated_items.end()) {
            double rank = rank_according_to_nearest_neighbors(k, u, item, R);
            scored_items.push_back({rank, item});
        }
    }
    sort(scored_items.begin(), scored_items.end(),
         [](const pair<double,int>& a, const pair<double,int>& b) {
             return a.first > b.first;
         });
    vector<int> top_items;
    for (int i = 0; i < N && i < (int)scored_items.size(); i++) {
        top_items.push_back(scored_items[i].second);
    }
    return top_items;
}

int main() {
    int N = 3;
    int k = 2;
    int u = 0;

    vector<int> all_items = {0, 1, 2, 3, 4, 5};
    vector<vector<double>> R = {
        {5, 0, 3, 0, 0, 0}, 
        {4, 2, 0, 3, 0, 0}, 
        {0, 5, 4, 0, 2, 0}, 
        {0, 0, 0, 4, 5, 3}
    };

    User usr;
    usr.rated_items = {0, 2};

    vector<int> recommendations = recommend_items(N, k, u, all_items, R, usr);

    cout << "Recommended items: ";
    for (int item : recommendations) {
        cout << item << " ";
    }
    cout << endl;
}
