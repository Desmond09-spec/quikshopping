-- Add security question fields to admin_settings table
ALTER TABLE admin_settings 
ADD COLUMN security_question TEXT,
ADD COLUMN security_answer_hash TEXT;

-- Create table for tracking PIN reset attempts (rate limiting)
CREATE TABLE IF NOT EXISTS pin_reset_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  admin_email TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pin_reset_attempts
ALTER TABLE pin_reset_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for pin_reset_attempts
CREATE POLICY "Users can view their own reset attempts" 
ON pin_reset_attempts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reset attempts" 
ON pin_reset_attempts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reset attempts" 
ON pin_reset_attempts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Service role can manage all attempts (for edge functions)
CREATE POLICY "Service role can manage all reset attempts" 
ON pin_reset_attempts 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create index for faster lookups
CREATE INDEX idx_pin_reset_attempts_user_id ON pin_reset_attempts(user_id);
CREATE INDEX idx_pin_reset_attempts_email ON pin_reset_attempts(admin_email);