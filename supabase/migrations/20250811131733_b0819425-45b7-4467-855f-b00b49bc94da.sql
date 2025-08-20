-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.clone_demo_data_for_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  demo_categories TEXT[] := ARRAY['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports'];
  category_name TEXT;
  new_category_id UUID;
BEGIN
  -- Insert demo categories
  FOREACH category_name IN ARRAY demo_categories
  LOOP
    INSERT INTO public.categories (user_id, name)
    VALUES (target_user_id, category_name)
    RETURNING id INTO new_category_id;
    
    -- Insert demo products for each category
    CASE category_name
      WHEN 'Electronics' THEN
        INSERT INTO public.products (user_id, name, price, quantity, category_id, description)
        VALUES 
        (target_user_id, 'Smartphone', 599.99, 25, new_category_id, 'Latest model smartphone with advanced features'),
        (target_user_id, 'Laptop', 999.99, 15, new_category_id, 'High-performance laptop for work and gaming');
      
      WHEN 'Clothing' THEN
        INSERT INTO public.products (user_id, name, price, quantity, category_id, description)
        VALUES 
        (target_user_id, 'T-Shirt', 19.99, 50, new_category_id, 'Comfortable cotton t-shirt'),
        (target_user_id, 'Jeans', 49.99, 30, new_category_id, 'Premium denim jeans');
      
      WHEN 'Home & Garden' THEN
        INSERT INTO public.products (user_id, name, price, quantity, category_id, description)
        VALUES 
        (target_user_id, 'Coffee Maker', 79.99, 20, new_category_id, 'Automatic drip coffee maker'),
        (target_user_id, 'Garden Hose', 29.99, 15, new_category_id, 'Flexible garden hose');
      
      ELSE
        -- Add at least one product for other categories
        INSERT INTO public.products (user_id, name, price, quantity, category_id, description)
        VALUES 
        (target_user_id, 'Sample Product', 9.99, 10, new_category_id, 'Demo product for ' || category_name);
    END CASE;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  -- Clone demo data
  PERFORM public.clone_demo_data_for_user(NEW.id);
  
  RETURN NEW;
END;
$$;