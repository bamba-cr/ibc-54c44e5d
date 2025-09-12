-- First add the city_id column as nullable
ALTER TABLE public.students 
ADD COLUMN city_id UUID;

-- Add foreign key constraint
ALTER TABLE public.students 
ADD CONSTRAINT fk_students_city 
FOREIGN KEY (city_id) REFERENCES public.cities(id);

-- Remove the old city column 
ALTER TABLE public.students 
DROP COLUMN city;