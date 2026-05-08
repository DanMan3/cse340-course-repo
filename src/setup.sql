-- create organization table
CREATE TABLE organization (
  organization_id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  logo_filename VARCHAR(255) NOT NULL
);


INSERT INTO organization (name, description, contact_email, logo_filename)
VALUES
  ('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
  ('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
  ('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');


  SELECT * FROM organization;


-- create projects table
CREATE TABLE project (
  project_id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organization(organization_id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  date DATE NOT NULL
);

-- sample projects (5 per organization)
INSERT INTO project (organization_id, title, description, location, date) VALUES
  (1, 'Neighborhood Playground Build', 'Build safe play equipment for local park', 'Eastside Park', '2026-06-12'),
  (1, 'Affordable Housing Repair', 'Minor home repairs for low-income families', 'Various', '2026-07-03'),
  (1, 'Community Garden Construction', 'Create raised beds and irrigation', 'Maple Community Garden', '2026-05-22'),
  (1, 'Senior Ramp Installation', 'Install wheelchair ramps for seniors', 'Multiple Homes', '2026-08-15'),
  (1, 'After-School STEM Lab Setup', 'Equip a local school with STEM kits', 'Riverside School', '2026-09-01'),
  (2, 'Urban Farm Planting Day', 'Plant seasonal crops and teach techniques', 'Green Harvest Lot', '2026-05-29'),
  (2, 'Farmers Market Stand Setup', 'Help run a community farmers market stand', 'Downtown Plaza', '2026-06-19'),
  (2, 'Composting Workshop', 'Teach community composting', 'Community Center', '2026-07-10'),
  (2, 'School Garden Mentoring', 'Help students maintain their garden', 'Lincoln Elementary', '2026-08-05'),
  (2, 'Food Donation Processing', 'Sort and package donated produce', 'GreenHarvest Warehouse', '2026-09-12'),
  (3, 'Neighborhood Cleanup', 'Collect trash and recyclables', 'Riverwalk', '2026-05-16'),
  (3, 'Holiday Meal Delivery', 'Prepare and deliver holiday meals', 'Citywide', '2026-12-20'),
  (3, 'Free Tutoring Sessions', 'Volunteer tutors for students', 'Community Library', '2026-06-26'),
  (3, 'Clothing Drive', 'Collect and distribute clothing donations', 'Community Center', '2026-10-08'),
  (3, 'Disaster Relief Prep', 'Assemble emergency supply kits', 'Warehouse 3', '2026-11-02');


SELECT * FROM project;
SELECT p.*, o.name AS organization_name
FROM project p
JOIN organization o ON p.organization_id = o.organization_id
ORDER BY p.date;