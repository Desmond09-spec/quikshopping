-- Add clear_data edge function to handle data deletion
CREATE OR REPLACE FUNCTION clear_user_data(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  deleted_counts json;
BEGIN
  -- Check if the user is the owner
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only clear your own data';
  END IF;

  -- Delete user data and count records
  WITH deletion_summary AS (
    SELECT 
      (SELECT COUNT(*) FROM transactions WHERE user_id = target_user_id) as transactions_count,
      (SELECT COUNT(*) FROM activities WHERE user_id = target_user_id) as activities_count,
      (SELECT COUNT(*) FROM products WHERE user_id = target_user_id) as products_count,
      (SELECT COUNT(*) FROM categories WHERE user_id = target_user_id) as categories_count
  )
  SELECT row_to_json(deletion_summary) INTO deleted_counts FROM deletion_summary;

  -- Delete user data in correct order (respecting foreign keys)
  DELETE FROM transactions WHERE user_id = target_user_id;
  DELETE FROM activities WHERE user_id = target_user_id;
  DELETE FROM products WHERE user_id = target_user_id;
  DELETE FROM categories WHERE user_id = target_user_id;
  DELETE FROM admin_settings WHERE owner_user_id = target_user_id;
  DELETE FROM otp_codes WHERE user_id = target_user_id;
  DELETE FROM pin_reset_attempts WHERE user_id = target_user_id;

  -- Log the data clearing activity
  INSERT INTO activities (user_id, type, description, details)
  VALUES (
    target_user_id,
    'data_cleared',
    'All user data has been permanently deleted',
    json_build_object(
      'cleared_at', now(),
      'deleted_counts', deleted_counts
    )
  );

  RETURN deleted_counts;
END;
$$;