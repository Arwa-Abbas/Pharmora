-- users table
INSERT INTO "public"."users" ("user_id", "name", "email", "phone", "address", "password_hash", "role") 
VALUES ('3', 'Sarah Kim', 'sarah.kim@example.com', '5551239876', '77 Green Ave', 'hashed_pw3', 'Patient'), 
('12', 'Arwa Abbas', 'arwa@gmail.com', '0300-1020202', '23 Street', '$2b$10$PiA5EnNa2IejHcRSGs7EIep1F0oNo/xKkejQjGnWsJsKAm1XGecgC', 'Patient'), 
('13', 'Fatima Yaqoob', 'fatima01@gmail.com', '0312-0202020', '5B Street', '$2b$10$RcN35/xjc8aDv3qUNQhFdO76wf2c9al.Kf8dxdC0Pq0mIV.Ae7woW', 'Pharmacist'),
 ('16', 'Jane Watson', 'jane002@gmail.com', '0342-3030300', '1234 Street 5B', '$2b$10$tv6OOF4SNFqHzludJRbnB.OOIVBYxHYZiIbLy6LEjKxQYtM.37nCu', 'Supplier'), 
('18', 'Jane Watson', 'jane001@gmail.com', '0342-3030300', '1234 Street 5B', '$2b$10$QF5doIVJ3Fqc7E7s1AAqQuNdT5b9SjAckB4oCVj3USGTS6Nv6Q.NG', 'Supplier'), 
('21', 'Hassan Sheikh', 'hassan123@gmail.com', '0300-2010101', 'Street 1235', '$2b$10$6CNIjnDXxFsUu6BN5QgzD.e8Jpznxrr0sNk7vzu3IJnKi809hFpy2', 'Doctor'), 
('22', 'Nabira Khan', 'nabira@example.com', '032112345678', 'my address bleh', '$2b$10$q4twZLJzzlxR/EmBWBBXD.sts/LbetRrVwaLLjgoBiAM6rnxJFbgi', 'Doctor'), 
('26', 'Nabira Khan', 'nabira@gmail.com', '03142201198', 'DHA Phase II Ext, 11th Commercial Street, 65C, Flat#03, Karachi, Pakistan', '$2b$10$pXFZW8eOYil2ilX1LJ5eD.dLYPeFJpNXvYrq0y3ebcw3q5SkFQUVm', 'Patient'), 
('30', 'Saima Khan', 'saima@gmail.com', '03142201199', 'dha pahse 2', '$2b$10$UNE9PObSrEBPjbT1FZSz.OGEal3D2pLuEi5PziImwbzmbgMNlaZpe', 'Doctor'), 
('31', 'rafay iqbal', 'rafay@gmail.com', '124', 'street 456', '$2b$10$6BRVd7LnWiQJwVLSRaMdoub3alwgRoWkj7LrCOIhsxZjA2tQwC0fW', 'Supplier'), 
('32', 'Raima Khan', 'raima@gmail.com', '1234567890', 'address changed again', '$2b$10$3d8/.ndamooyyoapYd1G/eOl756wC6Ru6CHxjuZFXMSfHozIlnxw2', 'Pharmacist'), 
('33', 'Admin User', 'admin@gmail.com', '0000000000', 'Admin HQ', 'Admin1234@', 'Admin');


-- suppliers table
INSERT INTO "public"."suppliers" ("supplier_id", "first_name", "last_name", "email", "phone", "address", "city", "country", "company_name", "supplier_reg_id", "password", "user_id") 
VALUES ('2', 'rafay', 'iqbal', 'rafay@gmail.com', '124', 'street 456', 'karachi', 'pakistan', 'PharmaTech', '1222', '$2b$10$6BRVd7LnWiQJwVLSRaMdoub3alwgRoWkj7LrCOIhsxZjA2tQwC0fW', '31');


-- doctors table
INSERT INTO "public"."doctors" ("doctor_id", "first_name", "last_name", "email", "phone", "address", "city", "country", "specialty", "medical_license", "password", "user_id") 
VALUES ('2', 'Hassan', 'Sheikh', 'hassan123@gmail.com', '0300-2010101', 'Street 1235', 'Karachi', 'Pakistan', 'General Physician', 'MB120393', '$2b$10$6CNIjnDXxFsUu6BN5QgzD.e8Jpznxrr0sNk7vzu3IJnKi809hFpy2', '21'), 
('3', 'Nabira', 'Khan', 'nabira@example.com', '032112345678', 'my address bleh', 'Karachi', 'Pakistan', 'Opthamology', '12569021', '$2b$10$q4twZLJzzlxR/EmBWBBXD.sts/LbetRrVwaLLjgoBiAM6rnxJFbgi', '22'), 
('4', 'Saima', 'Khan', 'saima@gmail.com', '03142201199', 'dha pahse 2', 'Karachi', 'Pakistan', 'Opthamology', '12345678', '$2b$10$UNE9PObSrEBPjbT1FZSz.OGEal3D2pLuEi5PziImwbzmbgMNlaZpe', '30');


-- medicines table
INSERT INTO "public"."medicines" ("medicine_id", "supplier_id", "name", "category", "description", "price", "stock", "expiry_date", "image_url")
 VALUES ('1', '1', 'Paracetamol 500mg', 'Painkiller', 'Relieves mild to moderate pain', '2.50', '187', '2026-03-01', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Paracetamol%20500mg.jpg'), 
('2', '2', 'Amoxicillin 250mg', 'Antibiotic', 'Treats bacterial infections', '5.20', '489', '2025-11-15', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Amoxicillin%20250mg.jpeg'), 
('3', '3', 'Cetirizine 10mg', 'Antihistamine', 'Used for allergy relief', '3.00', '298', '2026-06-30', null), 
('4', '4', 'Ibuprofen 200mg', 'Painkiller', 'Reduces inflammation and fever', '4.75', '176', '2025-09-01', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Ibuprofen%20400mg.jpeg'), 
('5', '5', 'Omeprazole 20mg', 'Antacid', 'Treats acid reflux', '6.50', '120', '2026-02-10', null), 
('6', '1', 'Panadol Extra', 'Painkiller', 'Paracetamol with Caffeine for enhanced pain relief.', '5.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Panadol%20Extra.webp'), 
('7', '2', 'Brufen 400mg', 'NSAID', 'Ibuprofen 400mg tablet for pain and inflammation.', '10.00', '198', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Brufen%20400mg.jpg'), 
('8', '3', 'Disprin', 'Painkiller', 'Soluble Aspirin for headache and fever.', '4.00', '99', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Disprin.webp'), 
('9', '4', 'Augmentin 625mg', 'Antibiotic', 'Amoxicillin and Clavulanic acid antibiotic.', '60.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Augmentin%20625mg.webp'), 
('10', '5', 'Amoxil 500mg', 'Antibiotic', 'Amoxicillin capsule (broad-spectrum antibiotic).', '25.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Amoxil%20500mg.jpg'), 
('11', '1', 'Norvasc 5mg', 'Cardiovascular', 'Amlodipine for high blood pressure.', '45.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Norvasc%205mg.jpg'), 
('12', '2', 'Mucaine Suspension', 'Antacid', 'Antacid for stomach pain and heartburn.', '15.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Mucaine%20Suspension.webp'), 
('13', '3', 'Flagyl 400mg', 'Antibiotic', 'Metronidazole tablet (antibiotic for infections).', '12.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Flagyl%20400mg.jpg'), 
('14', '4', 'Ciprobay 500mg', 'Antibiotic', 'Ciprofloxacin (broad-spectrum antibiotic).', '30.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Ciprobay%20500mg.webp'), 
('15', '5', 'Buscopan', 'Antispasmodic', 'Antispasmodic for abdominal cramps and pain.', '8.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Buscopan.webp'), 
('16', '1', 'Gravinate', 'Anti-emetic', 'Dimenhydrinate for nausea and motion sickness.', '5.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Gravinate.jpg'), 
('17', '2', 'Piriton', 'Antihistamine', 'Chlorphenamine Maleate (antihistamine).', '7.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Piriton.jpg'), 
('18', '3', 'Vicks VapoRub', 'Topical Analgesic', 'Topical analgesic for cold and cough relief.', '18.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Vicks%20VapoRub.jpg'), 
('19', '4', 'Strepsils Honey & Lemon', 'Sore Throat', 'Antiseptic lozenges for sore throat relief.', '5.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Strepsils.jpg'), 
('20', '5', 'Polyfax Skin Ointment', 'Antibiotic', 'Antibiotic ointment for minor skin cuts and burns.', '14.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Polyfax%20Ointment.webp'), 
('21', '1', 'Omez (Omeprazole)', 'Antacid', 'PPI for stomach ulcers and acid reflux.', '20.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Omez.jpeg'), 
('22', '2', 'Hydryllin Syrup', 'Cough/Cold', 'Cough and cold syrup with diphenhydramine.', '15.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Hydryllin%20Syrup.webp'), 
('23', '3', 'Calcium Sandoz', 'Supplement', 'Effervescent calcium and Vitamin C supplement.', '18.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Calcium%20Sandoz.jpg'), 
('24', '4', 'Liv-52', 'Supplement', 'Herbal supplement for liver support.', '10.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Liv-52.jpg'), 
('25', '5', 'Smecta Sachet', 'Gastrointestinal', 'Diosmectite powder for acute and chronic diarrhea.', '12.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Smecta.jpg'), 
('26', '1', 'Enterogermina', 'Probiotic', 'Probiotic suspension for restoring gut flora.', '18.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Enterogermina.webp'), 
('27', '2', 'Tofisopam (Grandaxin)', 'Anxiolytic', 'Anti-anxiety medication.', '22.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Tofisopam.jpg'), 
('28', '3', 'Norsaline-P Nasal Drops', 'Nasal Decongestant', 'Saline nasal drops for congestion relief.', '8.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Norsaline-P.jpg'), 
('29', '4', 'Peditral Powder', 'ORS', 'ORS (Oral Rehydration Solution) for dehydration.', '6.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Peditral.webp'), 
('30', '5', 'Fefol Spansule', 'Supplement', 'Iron and Folic Acid supplement for anemia.', '15.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Fefol%20Spansule.webp'), 
('31', '1', 'Calpol Plus', 'Painkiller', 'Paracetamol and Caffeine for headache relief.', '10.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Calpol%20Plus.jpg'), 
('32', '2', 'Gaviscon Advance', 'Antacid', 'Antacid for fast relief from heartburn.', '20.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Gaviscon%20Advance.jpeg'), 
('33', '3', 'Surbex Z', 'Supplement', 'High-potency Vitamin B complex with Zinc.', '12.00', '100', '2026-12-31', null), 
('34', '4', 'Ponstan Forte', 'Painkiller', 'Mefenamic Acid for severe menstrual pain.', '18.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Ponstan%20Forte.jpg'), 
('35', '5', 'Brufen Suspension', 'NSAID', 'Ibuprofen suspension for pain and fever in children.', '15.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Brufen%20Suspension.webp'), 
('36', '1', 'Maxolon Tablet', 'Anti-emetic', 'Treats nausea and vomiting (Metoclopramide).', '5.00', '100', '2026-12-31', null), 
('37', '2', 'Arinac Tablet', 'Cold/Flu', 'Combination for cold and allergy symptoms.', '180.00', '200', '2026-10-15', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Arinac%20Tablet.jpeg'), 
('38', '3', 'Ceporex 500mg', 'Antibiotic', 'Cephalexin antibiotic capsule.', '25.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Ceporex%20500mg.jpg'), 
('39', '4', 'Centrum Adults', 'Multivitamin', 'Comprehensive daily multivitamin tablet.', '30.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Centrum%20Adults.jpg'), 
('40', '5', 'Tamsolin (Tamsulosin)', 'Urology', 'Alpha-blocker for Benign Prostatic Hyperplasia (BPH).', '25.00', '100', '2026-12-31', null), 
('41', '1', 'Panadol Tablets', 'Painkiller', 'Standard Paracetamol 500mg for pain and fever.', '3.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Panadol%20Tablets.jpg'), 
('42', '2', 'Rulid (Roxithromycin)', 'Antibiotic', 'Macrolide antibiotic for various infections.', '35.00', '100', '2026-12-31', null), 
('43', '3', 'Atarax Tablet', 'Antihistamine', 'Antihistamine (Hydroxyzine) for allergies and anxiety.', '8.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Atarax%20Tablet.jpeg'), 
('44', '4', 'Diclofenac Gel', 'NSAID', 'Topical NSAID for localized joint and muscle pain.', '7.00', '100', '2026-12-31', null), 
('45', '5', 'Fexofenadine', 'Antihistamine', 'Non-drowsy antihistamine for seasonal allergies.', '15.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Fexofenadine.jpg'), 
('46', '1', 'Glibenclamide', 'Diabetic', 'Oral medication for Type 2 Diabetes.', '3.00', '100', '2026-12-31', null), 
('47', '2', 'Nexum (Esomeprazole)', 'Antacid', 'Proton pump inhibitor for GERD/Acidity.', '28.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Nexum.webp'), 
('48', '3', 'Clotrimazole Cream', 'Antifungal', 'Antifungal cream for skin infections.', '6.00', '100', '2026-12-31', null), 
('49', '4', 'Metoprolol', 'Cardiovascular', 'Beta-blocker for high blood pressure and heart rate control.', '5.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Metoprolol.jpg'), 
('50', '5', 'Loperamide (Imodium Generic)', 'Anti-diarrheal', 'Anti-diarrheal medication.', '3.00', '100', '2026-12-31', null), 
('51', '1', 'Ventolin Inhaler', 'Respiratory', 'Salbutamol inhaler for asthma relief.', '45.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Ventolin%20Inhaler.jpg'), 
('52', '2', 'Crestor (Rosuvastatin)', 'Cardiovascular', 'Statin medication to lower cholesterol.', '8.99', '200', '2025-11-26', null), 
('53', '3', 'Fluticasone Nasal Spray', 'Respiratory', 'Corticosteroid spray for nasal allergies/inflammation.', '18.00', '100', '2026-12-31', null), 
('54', '4', 'Lactulose Syrup', 'Laxative', 'Used as a laxative for constipation relief.', '12.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Lactulose%20Syrup.jpg'), 
('55', '5', 'Vitamin D3 1000 IU', 'Supplement', 'High-strength Vitamin D supplement.', '10.00', '100', '2026-12-31', null), 
('56', '1', 'Tamsolin (Tamsulosin)', 'Urology', 'Alpha-blocker for Benign Prostatic Hyperplasia (BPH).', '25.00', '100', '2026-12-31', null),
 ('57', '2', 'Panadol Tablets', 'Painkiller', 'Standard Paracetamol 500mg for pain and fever.', '3.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Panadol%20Tablets.jpg'), 
 ('58', '3', 'Rulid (Roxithromycin)', 'Antibiotic', 'Macrolide antibiotic for various infections.', '35.00', '100', '2026-12-31', null), 
 ('59', '4', 'Atarax Tablet', 'Antihistamine', 'Antihistamine (Hydroxyzine) for allergies and anxiety.', '8.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Atarax%20Tablet.jpeg'), 
 ('60', '5', 'Diclofenac Gel', 'NSAID', 'Topical NSAID for localized joint and muscle pain.', '7.00', '100', '2026-12-31', null), 
 ('61', '1', 'Fexofenadine', 'Antihistamine', 'Non-drowsy antihistamine for seasonal allergies.', '15.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Fexofenadine.jpg'),
('62', '2', 'Glibenclamide', 'Diabetic', 'Oral medication for Type 2 Diabetes.', '3.00', '100', '2026-12-31', null), 
('63', '3', 'Nexum (Esomeprazole)', 'Antacid', 'Proton pump inhibitor for GERD/Acidity.', '28.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Nexum.webp'), 
('64', '4', 'Clotrimazole Cream', 'Antifungal', 'Antifungal cream for skin infections.', '6.00', '100', '2026-12-31', null), 
('65', '5', 'Metoprolol', 'Cardiovascular', 'Beta-blocker for high blood pressure and heart rate control.', '5.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Metoprolol.jpg'), 
('66', '1', 'Loperamide (Imodium Generic)', 'Anti-diarrheal', 'Anti-diarrheal medication.', '3.00', '100', '2026-12-31', null), 
('67', '2', 'Ventolin Inhaler', 'Respiratory', 'Salbutamol inhaler for asthma relief.', '45.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Ventolin%20Inhaler.jpg'), 
('68', '3', 'Crestor (Rosuvastatin)', 'Cardiovascular', 'Statin medication to lower cholesterol.', '30.00', '100', '2026-12-31', null), 
('69', '4', 'Fluticasone Nasal Spray', 'Respiratory', 'Corticosteroid spray for nasal allergies/inflammation.', '18.00', '100', '2026-12-31', null), 
('70', '5', 'Lactulose Syrup', 'Laxative', 'Used as a laxative for constipation relief.', '12.00', '100', '2026-12-31', 'https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/Lactulose%20Syrup.jpg'), 
('71', '1', 'Vitamin D3 1000 IU', 'Supplement', 'High-strength Vitamin D supplement.', '10.00', '100', '2026-12-31', null), 
('72', '2', 'Panadel', 'Antibiotic', '', '12.00', '100', '2025-11-29', '');


-- pharmacists table
INSERT INTO "public"."pharmacists" ("pharmacist_id", "first_name", "last_name", "email", "phone", "address", "city", "country", "pharmacy_name", "pharmacy_license", "password", "user_id") 
VALUES ('1', 'Fatima', 'Yaqoob', 'fatima01@gmail.com', '0312-0202020', '5B Street', 'Karachi', 'Pakistan', 'Pharmacy A', 'P102020', '$2b$10$RcN35/xjc8aDv3qUNQhFdO76wf2c9al.Kf8dxdC0Pq0mIV.Ae7woW', '13'), 
('2', 'Raima', 'Khan', 'raima@gmail.com', '1234567890', 'address changed again', 'Karachi', 'Pakistan', 'Frankenstien', '12345678', '$2b$10$3d8/.ndamooyyoapYd1G/eOl756wC6Ru6CHxjuZFXMSfHozIlnxw2', '32');


--patients table
INSERT INTO "public"."patients" ("patient_id", "first_name", "last_name", "email", "phone", "address", "city", "country", "password", "user_id", "primary_doctor_id") 
VALUES ('7', 'Arwa', 'Abbas', 'arwa@gmail.com', '0300-1020202', '23 Street', 'Karachi', 'Pakistan', '$2b$10$PiA5EnNa2IejHcRSGs7EIep1F0oNo/xKkejQjGnWsJsKAm1XGecgC', '12', '30'), 
('8', 'Nabira', 'Khan', 'nabira@gmail.com', '03142201198', 'DHA Phase II Ext, 11th Commercial Street, 65C, Flat#03, Karachi, Pakistan', 'Karachi', 'Pakistan', '$2b$10$pXFZW8eOYil2ilX1LJ5eD.dLYPeFJpNXvYrq0y3ebcw3q5SkFQUVm', '26', '30');


-- cart_items table
INSERT INTO "public"."cart_items" ("cart_item_id", "user_id", "medicine_id", "quantity", "added_at") 
VALUES ('8', '30', '1', '1', '2025-11-13 19:28:46.647326'), 
('9', '30', '2', '1', '2025-11-13 19:28:49.102519');


--prescriptions table
INSERT INTO "public"."prescriptions" ("prescription_id", "patient_id", "doctor_id", "date_issued", "status", "prescription_image", "notes", "diagnosis", "order_id") 
VALUES ('2', '26', '21', '2025-09-15', 'Verified', null, null, null, '2'), 
('4', '26', '21', '2025-08-25', 'Pending', null, null, null, '4');


-- prescribed_medicines
INSERT INTO "public"."prescribed_medicines" ("prescribed_medicine_id", "prescription_id", "medicine_id", "dosage", "frequency", "duration", "created_at") 
VALUES ('2', '15', '15', '', '', '', '2025-11-18 08:01:50.216514'), 
('3', '18', '39', '1', '2', '10', '2025-11-20 19:59:05.043603'), 
('4', '20', '20', '10mg', '2', '10 days', '2025-11-21 10:39:05.393091'), 
('5', '24', '20', '1', 'twice a day', '2 weeks', '2025-11-21 11:30:31.786199'), 
('6', '26', '20', '1', '2x a day', '2 weeks', '2025-11-21 11:36:34.438721');


--orders table
INSERT INTO "public"."orders" ("order_id", "user_id", "prescription_id", "order_date", "total_price", "status", "delivery_address") 
VALUES ('2', '3', '2', '2025-09-16 10:00:00', '23.00', 'Processing', null), 
('4', '3', '4', '2025-08-26 18:45:00', '12.40', 'Delivered', null), 
('6', '26', '12', '2025-11-12 13:34:24.771021', '28.20', 'Pending', 'dha'), 
('7', '26', '11', '2025-11-12 13:46:23.546666', '12.90', 'Pending', 'dha '), 
('8', '26', '9', '2025-11-13 20:35:32.282797', '2.50', 'Pending', 'new address'), 
('9', '26', '13', '2025-11-14 08:58:05.078203', '7.70', 'Pending', 'jiweoifjowjfiowejf'), 
('10', '26', '14', '2025-11-18 07:59:23.331973', '7.70', 'Pending', 'hgfggjhgkjhkj'), 
('11', '26', null, '2025-11-20 14:15:54.340116', '2.50', 'Pending', 'street 5a'), 
('12', '26', null, '2025-11-20 19:14:02.902832', '7.70', 'Pending', 'dhihdhilwh'), 
('13', '26', '16', '2025-11-20 19:14:10.316686', '7.70', 'Pending', 'dhihdhilwh'), 
('14', '26', '17', '2025-11-20 19:19:37.042343', '8.20', 'Pending', 'ijijij'), 
('15', '26', null, '2025-11-20 19:57:45.629116', '5.00', 'Pending', 'jojojio'), 
('16', '26', null, '2025-11-21 10:15:32.486894', '7.25', 'Pending', 'DHA Phase 2 ext'), 
('17', '26', '19', '2025-11-21 10:16:51.216205', '7.70', 'Pending', 'DHA phase 2'), 
('18', '26', '22', '2025-11-21 11:20:59.829974', '7.25', 'Pending', 'North Nazimabad'), 
('19', '26', '23', '2025-11-21 11:28:04.481546', '12.00', 'Pending', 'North Nazimabad Block 15'), 
('20', '26', '25', '2025-11-21 11:35:00.002916', '14.40', 'Pending', 'North Nazimabad Block 2');


-- order_items table
INSERT INTO "public"."order_items" ("order_item_id", "order_id", "medicine_id", "quantity", "price") 
VALUES ('1', '6', '3', '1', '3.00'), 
('2', '6', '2', '1', '5.20'), 
('3', '6', '7', '2', '10.00'), 
('4', '7', '1', '1', '2.50'), 
('5', '7', '2', '2', '5.20'), 
('6', '8', '1', '1', '2.50'), 
('7', '9', '1', '1', '2.50'), 
('8', '9', '2', '1', '5.20'), 
('9', '10', '1', '1', '2.50'), 
('10', '10', '2', '1', '5.20'), 
('11', '11', '1', '1', '2.50'), 
('12', '13', '2', '1', '5.20'), 
('13', '13', '1', '1', '2.50'), 
('14', '12', '2', '1', '5.20'), 
('15', '12', '1', '1', '2.50'), 
('16', '14', '3', '1', '3.00'), 
('17', '14', '2', '1', '5.20'), 
('18', '15', '1', '2', '2.50'), 
('19', '16', '1', '1', '2.50'), 
('20', '16', '4', '1', '4.75'), 
('21', '17', '1', '1', '2.50'), 
('22', '17', '2', '1', '5.20'), 
('23', '18', '1', '1', '2.50'), 
('24', '18', '4', '1', '4.75'), 
('25', '19', '1', '1', '2.50'), 
('26', '19', '4', '2', '4.75'), 
('27', '20', '8', '1', '4.00'), 
('28', '20', '2', '2', '5.20');


-- payment table
INSERT INTO "public"."payment" ("payment_id", "order_id", "user_id", "date", "amount", "method", "card_last_four") 
VALUES ('1', '10', '26', '2025-11-20 15:35:57.035932', '7.70', 'debit_card', '5676'), 
('2', '9', '26', '2025-11-20 15:38:44.062457', '7.70', 'bank_transfer', ''), 
('3', '17', '26', '2025-11-21 10:20:39.159996', '7.70', 'credit_card', '1234'), 
('4', '19', '26', '2025-11-21 11:29:04.537879', '12.00', 'credit_card', '2345'), 
('5', '20', '26', '2025-11-21 11:35:37.67088', '14.40', 'bank_transfer', '');


-- supplier_inventory table
INSERT INTO "public"."supplier_inventory" ("inventory_id", "supplier_id", "medicine_id", "quantity_available", "reorder_level", "purchase_price", "selling_price", "expiry_date", "created_at", "updated_at") 
VALUES ('1', '2', '15', '20', '20', '150.00', '180.00', '2026-01-06', '2025-11-18 15:36:38.226104', '2025-11-18 15:36:38.226104'), 
('3', '2', '2', '0', '20', '150.00', '200.00', '2025-11-27', '2025-11-18 16:14:34.42867', '2025-11-20 05:36:48.964496'), 
('4', '2', '7', '0', '20', '100.00', '130.00', '2025-11-28', '2025-11-20 05:30:06.313715', '2025-11-20 05:31:00.479946'), 
('5', '2', '52', '0', '20', '6.99', '8.99', '2025-11-26', '2025-11-20 05:59:17.591752', '2025-11-20 05:59:55.826083'), 
('6', '2', '37', '0', '20', '150.00', '180.00', '2026-10-15', '2025-11-21 09:19:19.671915', '2025-11-21 09:23:29.524007'),
 ('7', '2', '32', '100', '20', '20.00', '35.00', '2028-01-29', '2025-11-21 11:38:25.621576', '2025-11-21 11:38:25.621576');


-- stock_requests
INSERT INTO "public"."stock_requests" ("request_id", "pharmacist_id", "supplier_id", "medicine_id", "quantity_requested", "notes", "pharmacy_name", "request_date", "status", "delivery_status", "delivery_date", "created_at", "updated_at", "tracking_info", "shipped_date") 
VALUES ('4', '13', '2', '37', '50', 'note 1', 'Pharmacy A', '2025-11-18', 'Pending', 'NotShipped', null, '2025-11-18 16:04:28.555057', null, null, null), 
('6', '13', '2', '2', '50', 'notee | Added to pharmacy inventory on 2025-11-20 05:18:12.685881+00 | Added to pharmacy inventory on 2025-11-20 05:24:21.617898+00', 'Pharmacy A', '2025-11-18', 'Processed', 'Delivered', '2025-11-20', '2025-11-18 16:13:52.335088', '2025-11-20 05:24:21.617898', 'T123', '2025-11-20'), 
('7', '13', '2', '52', '200', 'delivered it fast', 'Pharmacy A', '2025-11-20', 'Rejected', 'NotShipped', null, '2025-11-20 04:13:31.875771', '2025-11-20 05:00:04.391359', null, null), 
('8', '13', '2', '7', '50', 'note sample | Added to pharmacy inventory on 2025-11-20 05:31:19.266061+00', 'Pharmacy A', '2025-11-20', 'Processed', 'Delivered', '2025-11-20', '2025-11-20 05:29:08.042225', '2025-11-20 05:31:19.266061', '', '2025-11-20'), 
('9', '13', '2', '2', '50', 'nn | Added to pharmacy inventory on 2025-11-20 05:50:16.457332+00', 'Pharmacy A', '2025-11-20', 'Processed', 'Delivered', '2025-11-20', '2025-11-20 05:32:59.763875', '2025-11-20 05:50:16.457332', 'T123', '2025-11-20'), 
('10', '13', '2', '52', '50', 'sample text here | Added to pharmacy inventory on 2025-11-20 06:00:12.643389+00', 'Pharmacy A', '2025-11-20', 'Processed', 'Delivered', '2025-11-20', '2025-11-20 05:58:09.242517', '2025-11-20 06:00:12.643389', 'T12333', '2025-11-20'), 
('11', '13', '2', '42', '40', 'n', 'Pharmacy A', '2025-11-20', 'Pending', 'NotShipped', null, '2025-11-20 06:16:53.766051', null, null, null), 
('12', '13', '2', '42', '40', 'n', 'Pharmacy A', '2025-11-20', 'Rejected', 'NotShipped', null, '2025-11-20 06:16:54.686914', '2025-11-20 06:17:31.088293', null, null), 
('13', '32', '2', '2', '10', 'hehehhe', 'Frankenstien', '2025-11-20', 'Pending', 'NotShipped', null, '2025-11-20 20:00:35.913018', null, null, null), 
('14', '13', '2', '37', '50', 'need 50 amounts of Arinac Tablet  | Added to pharmacy inventory on 2025-11-21 09:26:55.303181+00', 'Pharmacy A', '2025-11-21', 'Processed', 'Delivered', '2025-11-21', '2025-11-21 09:10:31.497993', '2025-11-21 09:26:55.303181', 'T12345', '2025-11-21'), 
('15', '32', '2', '32', '10', '', 'Frankenstien', '2025-11-21', 'Accepted', 'NotShipped', null, '2025-11-21 11:31:16.759729', '2025-11-21 11:38:37.665586', null, null), 
('16', '32', '2', '32', '10', '', 'Frankenstien', '2025-11-21', 'Pending', 'NotShipped', null, '2025-11-21 11:37:15.271889', null, null, null);


