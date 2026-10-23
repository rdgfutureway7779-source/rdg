-- RDG static seed data for Hostinger/phpMyAdmin.
-- Import server/schema.sql first.
-- The admin user is intentionally not inserted here. The application creates it
-- securely from ADMIN_EMAIL and ADMIN_PASSWORD during its first startup.

START TRANSACTION;

INSERT IGNORE INTO pages (title, slug, description, status, show_in_nav) VALUES
  ('Home', 'home', 'RDG Future Way home page', 'published', 1),
  ('About Us', 'about', 'Company story, vision, mission and leadership', 'published', 1),
  ('Anmol Ratan Juice', 'products', 'Signature herbal and mixed berry wellness product', 'published', 1),
  ('Business Opportunity', 'business-opportunity', 'Direct selling opportunity and journey', 'published', 1),
  ('Generation Plan', 'generation-plan', '15-level income and reward structure', 'published', 1),
  ('Income Calculator', 'income-calculator', 'Plan value and referral calculator', 'published', 0),
  ('Contact', 'contact', 'Contact and enquiry page', 'published', 1);

INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('company_name', JSON_QUOTE('RDG Future Way Pvt. Ltd.')),
  ('hero_title', JSON_QUOTE('Pure Herbal Nutrition for a Healthier Tomorrow')),
  ('hero_description', JSON_QUOTE('Anmol Ratan Juice is a herbal and mixed berry wellness drink for Indian families who want a refreshing, fruit-forward addition to their everyday routine.')),
  ('hero_cta_label', JSON_QUOTE('Discover the Goodness')),
  ('hero_cta_url', JSON_QUOTE('/products')),
  ('default_seo_title', JSON_QUOTE('RDG Future Way Pvt. Ltd. | Anmol Ratan Juice')),
  ('default_seo_description', JSON_QUOTE("Discover Anmol Ratan Juice, RDG Future Way's herbal and mixed berry wellness product and business opportunity."))
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

INSERT IGNORE INTO gallery_items (title, tag, image_url, alt_text, status, sort_order) VALUES
  ('Annual Leadership Meet', 'Events', '/uploads/gallery-leadership-meet.jpg', 'Speaker addressing an RDG business conference.', 'published', 0),
  ('Corporate Head Office', 'Office', '/uploads/gallery-head-office.jpg', 'RDG corporate head office.', 'published', 1),
  ('Product Launch Stage', 'Events', '/uploads/gallery-product-launch.jpg', 'RDG product launch event.', 'published', 2),
  ('Distributor Training Camp', 'Training', '/uploads/gallery-training-camp.jpg', 'Distributor training workshop.', 'published', 3),
  ('Manufacturing Facility', 'Office', '/uploads/gallery-manufacturing.jpg', 'RDG manufacturing facility.', 'published', 4);

INSERT IGNORE INTO downloads (slug, title, size_label, file_type, status, sort_order) VALUES
  ('company-brochure', 'Company Brochure', '4.2 MB', 'PDF', 'published', 0),
  ('anmol-ratan-juice-product-sheet', 'Anmol Ratan Juice Product Sheet', '12.8 MB', 'PDF', 'published', 1),
  ('generation-income-plan', 'Generation Income Plan', '3.1 MB', 'PDF', 'published', 2),
  ('distributor-application-form', 'Distributor Application Form', '0.6 MB', 'PDF', 'published', 3),
  ('price-list-dp-mrp', 'Price List (DP / MRP)', '1.9 MB', 'XLSX', 'published', 4),
  ('business-presentation', 'Business Presentation', '9.4 MB', 'PPTX', 'published', 5),
  ('training-material-pack', 'Training Material Pack', '22.5 MB', 'ZIP', 'published', 6);

INSERT IGNORE INTO events (slug, title, event_date, city, event_type, seats, status, sort_order) VALUES
  ('national-leadership-summit-2026', 'National Leadership Summit 2026', '2026-09-12', 'Indore', 'Seminar', 1200, 'published', 0),
  ('ayurveda-product-launch-immunity-series', 'Ayurveda Product Launch - Immunity Series', '2026-08-22', 'Bhopal', 'Launch', 400, 'published', 1),
  ('kisan-samriddhi-business-meet', 'Kisan Samriddhi Business Meet', '2026-10-05', 'Nagpur', 'Business Meet', 600, 'published', 2),
  ('rewards-recognition-night', 'Rewards & Recognition Night', '2026-11-18', 'Jaipur', 'Award Night', 900, 'published', 3);

COMMIT;
