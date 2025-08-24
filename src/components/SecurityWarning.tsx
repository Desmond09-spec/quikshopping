import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SecurityWarningProps {
  onSetupSecurity: () => void;
  variant?: 'inline' | 'dialog';
}

const SecurityWarning: React.FC<SecurityWarningProps> = ({ 
  onSetupSecurity, 
  variant = 'inline' 
}) => {
  if (variant === 'dialog') {
    return (
      <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          <div className="space-y-3">
            <p className="font-medium">Security question not set up</p>
            <p className="text-sm">
              You haven't set up a security question yet. Without a security question, 
              you won't be able to reset your admin PIN if you forget it.
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onSetupSecurity}
              className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/30"
            >
              <Shield className="w-4 h-4 mr-2" />
              Set Security Question Now
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex-1 min-w-0">
            <p className="font-medium">No security question set</p>
            <p className="text-sm mt-1">
              Set up a security question to enable PIN recovery
            </p>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onSetupSecurity}
            className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/30 flex-shrink-0 w-full sm:w-auto sm:ml-4"
          >
            <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Set Up</span>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SecurityWarning;