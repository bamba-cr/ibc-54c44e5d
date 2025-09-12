-- Update students table to use city_id instead of city text
ALTER TABLE public.students 
ADD COLUMN city_id UUID;

-- Add foreign key constraint
ALTER TABLE public.students 
ADD CONSTRAINT fk_students_city 
FOREIGN KEY (city_id) REFERENCES public.cities(id);

-- Remove the old city column after adding the new one
ALTER TABLE public.students 
DROP COLUMN city;

-- Make city_id NOT NULL after the column is added
ALTER TABLE public.students 
ALTER COLUMN city_id SET NOT NULL;