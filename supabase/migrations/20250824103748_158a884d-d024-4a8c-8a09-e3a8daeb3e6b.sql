-- Add missing whatsapp_number column to admin_settings table
ALTER TABLE admin_settings 
ADD COLUMN whatsapp_number text;