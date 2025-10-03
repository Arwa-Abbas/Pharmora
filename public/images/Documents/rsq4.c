#include <stdio.h>
#include <stdlib.h>

typedef struct {
int *rated;
int rated_count;
} User;

double rank_according_to_nearest_neighbors(int k, int u, int item, double **R) {
// Placeholder: replace with actual nearest neighbor ranking logic
return (double)item; // deterministic example using item ID
}

int is_rated(User *usr, int item) {
for (int i = 0; i < usr->rated_count; i++) {
if (usr->rated[i] == item) return 1;
}
return 0;
}

void recommend(int N, int k, int u, int *items, int items_count, double **R, User *usr, int *output, int *output_count) {
double *scores = (double*)malloc(items_count * sizeof(double));
int *indices = (int*)malloc(items_count * sizeof(int));
int candidate_count = 0;

for (int i = 0; i < items_count; i++) {
    int item = items[i];
    if (!is_rated(usr, item)) {
        scores[candidate_count] = rank_according_to_nearest_neighbors(k, u, item, R);
        indices[candidate_count] = item;
        candidate_count++;
    }
}

for (int i = 0; i < candidate_count - 1; i++) {
    for (int j = i + 1; j < candidate_count; j++) {
        if (scores[i] < scores[j]) {
            double temp_score = scores[i]; scores[i] = scores[j]; scores[j] = temp_score;
            int temp_item = indices[i]; indices[i] = indices[j]; indices[j] = temp_item;
        }
    }
}

*output_count = (N < candidate_count ? N : candidate_count);
for (int i = 0; i < *output_count; i++) output[i] = indices[i];

free(scores);
free(indices);

}

int main() {
int N = 3, k = 2, u = 0;
int items[] = {0,1,2,3,4,5};
int items_count = 6;

double **R = (double**)malloc(sizeof(double*));
R[0] = (double*)calloc(items_count, sizeof(double));

User usr;
int rated_items[] = {0,2};
usr.rated = rated_items;
usr.rated_count = 2;

int output[10], output_count;
recommend(N, k, u, items, items_count, R, &usr, output, &output_count);

for (int i = 0; i < output_count; i++) printf("%d ", output[i]);
printf("\n");

free(R[0]);
free(R);
return 0;

}
