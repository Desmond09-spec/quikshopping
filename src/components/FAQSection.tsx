import React from 'react';
import { HelpCircle, ShoppingCart, Users, Settings, Shield, Archive, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FAQSection: React.FC = () => {
  const faqCategories = [
    {
      category: "Getting Started",
      icon: <ShoppingCart className="w-5 h-5" />,
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      faqs: [
        {
          question: "How do I add my first product?",
          answer: "Navigate to 'Add Product' from the main menu or go to Settings > Product Management > Add Product. Fill in the product name, price, quantity, and category. You can also add a description and upload an image."
        },
        {
          question: "How do I process my first sale?",
          answer: "Go to the main shop page, add products to your cart by clicking on them, then click the cart icon. Review your items, enter customer details if required, select a payment method, and complete the sale."
        },
        {
          question: "What's the difference between cash and transfer payments?",
          answer: "Cash payments are recorded immediately without additional details. Transfer payments require customer information (name and phone) for record-keeping and follow-up purposes."
        }
      ]
    },
    {
      category: "Product Management",
      icon: <Archive className="w-5 h-5" />,
      color: "bg-green-500/20 text-green-400 border-green-500/30",
      faqs: [
        {
          question: "How do I organize products with categories?",
          answer: "Create categories in Settings > Category Manager. When adding products, assign them to appropriate categories. You can also create new categories while adding products."
        },
        {
          question: "How do I edit or delete products?",
          answer: "Go to Settings > Product Management or Products Inventory. Click the edit icon to modify product details or the trash icon to delete. Note: Admin permissions may be required depending on your settings."
        },
        {
          question: "Can I import products in bulk?",
          answer: "Currently, products must be added individually through the Add Product form. This ensures data accuracy and proper categorization for each item."
        },
        {
          question: "How do I track low stock items?",
          answer: "Check the Products Inventory page to see current stock levels. Products with low quantities will be highlighted. Consider setting up regular inventory reviews to maintain adequate stock."
        }
      ]
    },
    {
      category: "Cashier & Team Management",
      icon: <Users className="w-5 h-5" />,
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      faqs: [
        {
          question: "What are the different cashier sign-in modes?",
          answer: "Free Text mode allows any name to be entered. Secure (Dropdown) mode restricts to pre-approved cashier names only. The mode can be changed in Cashier Management by admin users."
        },
        {
          question: "How do I add approved cashiers?",
          answer: "In Settings > Cashier Management, admin users can add cashier names to the approved list. These names will appear in the dropdown when Secure mode is enabled."
        },
        {
          question: "Can I disable the cashier dialog completely?",
          answer: "Yes, admin users can disable the cashier confirmation dialog in Admin Settings. This skips cashier name entry for faster operations but reduces transaction tracking."
        },
        {
          question: "How do I track which cashier made which sale?",
          answer: "All sales and product operations record the cashier name. View this information in the History page or Activity Details for complete audit trails."
        }
      ]
    },
    {
      category: "Admin & Security",
      icon: <Shield className="w-5 h-5" />,
      color: "bg-red-500/20 text-red-400 border-red-500/30",
      faqs: [
        {
          question: "How do I set up admin access?",
          answer: "Go to Settings > Admin Settings > Setup Admin Access. You'll need to provide an admin email, WhatsApp number, create a 4+ digit PIN, and set up a security question for account recovery."
        },
        {
          question: "What if I forget my admin PIN?",
          answer: "Use 'Forgot PIN' during sign-in. Enter your admin email, then answer your security question to reset your PIN. Make sure your security question answer is memorable and accurate."
        },
        {
          question: "Why should I set up a security question?",
          answer: "Security questions enable PIN recovery if you're locked out. Without one, you may lose admin access permanently. Set one up immediately after admin setup for account security."
        },
        {
          question: "What does 'Require Admin for Product Actions' do?",
          answer: "When enabled, only admin users can add, edit, or delete products. This prevents unauthorized inventory changes but requires admin sign-in for all product operations."
        }
      ]
    },
    {
      category: "Data & Reports",
      icon: <Settings className="w-5 h-5" />,
      color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      faqs: [
        {
          question: "How do I view my sales history?",
          answer: "Go to the History page to see all transactions, product changes, and admin activities. Click on any entry to view detailed information about that activity."
        },
        {
          question: "Can I export my data?",
          answer: "Currently, data export isn't available. You can view and review all information through the History and Activity Details pages. Consider regular manual backups of important data."
        },
        {
          question: "How do I clear all my data?",
          answer: "Admin users can clear all data in Settings > Admin Settings > Clear All Data. This permanently deletes all products, sales, activities, and settings. This action cannot be undone."
        },
        {
          question: "Is my data secure?",
          answer: "Yes, all data is encrypted and stored securely. Access requires authentication, and admin functions require additional PIN verification. Follow security best practices like using strong PINs."
        }
      ]
    },
    {
      category: "Troubleshooting",
      icon: <HelpCircle className="w-5 h-5" />,
      color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      faqs: [
        {
          question: "Why can't I add/edit products?",
          answer: "Check if 'Require Admin for Product Actions' is enabled in admin settings. If so, you need to sign in as admin first. Also ensure you're properly authenticated to the app."
        },
        {
          question: "The cashier dialog isn't showing up",
          answer: "Admin users may have disabled the cashier dialog in Admin Settings. Check the 'Disable Cashier Dialog Modal' setting to re-enable cashier name confirmation."
        },
        {
          question: "I can't remember my security question answer",
          answer: "Security question answers are case-sensitive and must match exactly. Try common variations (with/without capitals, spaces, abbreviations). If you still can't access your account, you may need to clear your data and start fresh."
        },
        {
          question: "How do I install the app on my device?",
          answer: "Look for an 'Install App' button in Settings > App Settings. This creates a home screen shortcut for faster access. The option appears when your device supports it."
        },
        {
          question: "What if I encounter an error?",
          answer: "Try refreshing the page first. Check your internet connection. For persistent issues, note the error message and contact support with specific details about what you were doing."
        }
      ]
    }
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          <span>Frequently Asked Questions</span>
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Find answers to common questions about using QuikShopping effectively
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {faqCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color}`}>
                {category.icon}
              </div>
              <h3 className="text-lg font-semibold text-foreground">{category.category}</h3>
              <Badge variant="outline" className="text-xs">
                {category.faqs.length} questions
              </Badge>
            </div>
            
            <Accordion type="multiple" className="space-y-1">
              {category.faqs.map((faq, faqIndex) => (
                <AccordionItem 
                  key={faqIndex} 
                  value={`${categoryIndex}-${faqIndex}`}
                  className="border border-border rounded-lg px-4 data-[state=open]:bg-muted/30"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-3">
                    <span className="font-medium text-foreground text-sm pr-2">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-1">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
        
        <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">Still need help?</p>
              <p className="text-xs text-muted-foreground">
                If you couldn't find the answer you're looking for, try using the App Walkthrough 
                in Settings for a guided tour of all features.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FAQSection;