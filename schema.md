# Project Database & Storage Documentation

## 1. Database Tables (Public)
| Table | Column | Type | Nullable |
|---|---|---|---|
|activities | id | uuid | No |                                          |
|activities | user_id | uuid | No |                                     |
|activities | type | text | No |                                        |
|activities | description | text | No |                                 |
|activities | details | jsonb | Yes |                                   |
|activities | created_at | timestamp with time zone | No |              |
|activities | store_id | uuid | Yes |                                   |
|admin_settings | id | uuid | No |                                      |
|admin_settings | owner_user_id | uuid | No |                           |
|admin_settings | admin_email | text | No |                             |
|admin_settings | pin_hash | text | No |                                |
|admin_settings | device_cache_enabled | boolean | Yes |                |
|admin_settings | require_cashier_for_all_actions | boolean | Yes |     |
|admin_settings | created_at | timestamp with time zone | No |          |
|admin_settings | updated_at | timestamp with time zone | No |          |
|admin_settings | require_admin_for_product_actions | boolean | Yes |   |
|admin_settings | disable_cashier_dialog | boolean | Yes |              |
|admin_settings | cashier_signin_mode | text | Yes |                    |
|admin_settings | managed_cashiers | jsonb | Yes |                      |
|admin_settings | security_question | text | Yes |                      |
|admin_settings | security_answer_hash | text | Yes |                   |
|admin_settings | whatsapp_number | text | Yes |                        |
|categories | id | uuid | No |                                          |
|categories | user_id | uuid | No |                                     |
|categories | name | text | No |                                        |
|categories | created_at | timestamp with time zone | No |              |
|categories | updated_at | timestamp with time zone | No |              |
|categories | store_id | uuid | Yes |                                   |
|otp_codes | id | uuid | No |                                           |
|otp_codes | user_id | uuid | No |                                      |
|otp_codes | email | text | No |                                        |
|otp_codes | code | text | No |                                         |
|otp_codes | type | text | No |                                         |
|otp_codes | expires_at | timestamp with time zone | No |               |
|otp_codes | used | boolean | Yes |                                     |
|otp_codes | used_at | timestamp with time zone | Yes |                 |
|otp_codes | created_at | timestamp with time zone | No |               |
|pin_reset_attempts | id | uuid | No |                                  |
|pin_reset_attempts | user_id | uuid | No |                             |
|pin_reset_attempts | admin_email | text | No |                         |
|pin_reset_attempts | attempts | integer | No |                         |
|pin_reset_attempts | last_attempt_at | timestamp with time zone | No | |
|pin_reset_attempts | locked_until | timestamp with time zone | Yes |   |
|pin_reset_attempts | created_at | timestamp with time zone | No |      |
|products | id | uuid | No |                                            |
|products | user_id | uuid | No |                                       |
|products | name | text | No |                                          |
|products | price | numeric | No |                                      |
|products | quantity | integer | No |                                   |
|products | category_id | uuid | Yes |                                  |
|products | image_url | text | Yes |                                    |
|products | description | text | Yes |                                  |
|products | created_at | timestamp with time zone | No |                |
|products | updated_at | timestamp with time zone | No |                |
|products | store_id | uuid | Yes |                                     |
|products | created_by | uuid | Yes |                                   |
|profiles | id | uuid | No |                                            |
|profiles | user_id | uuid | No |                                       |
|profiles | display_name | text | Yes |                                 |
|profiles | created_at | timestamp with time zone | No |                |
|profiles | updated_at | timestamp with time zone | No |                |
|store_invitations | id | uuid | No |                                   |
|store_invitations | store_id | uuid | No |                             |
|store_invitations | email | text | No |                                |
|store_invitations | role | USER-DEFINED | No |                         |
|store_invitations | invited_by | uuid | No |                           |
|store_invitations | invitation_token | text | No |                     |
|store_invitations | expires_at | timestamp with time zone | No |       |
|store_invitations | accepted_at | timestamp with time zone | Yes |     |
|store_invitations | created_at | timestamp with time zone | Yes |      |
|stores | id | uuid | No |                                              |
|stores | owner_user_id | uuid | No |                                   |
|stores | store_name | text | No |                                      |
|stores | store_email | text | Yes |                                    |
|stores | whatsapp_number | text | Yes |                                |
|stores | admin_pin_hash | text | Yes |                                 |
|stores | security_question | text | Yes |                              |
|stores | security_answer_hash | text | Yes |                           |
|stores | disable_cashier_dialog | boolean | Yes |                      |
|stores | require_admin_for_product_actions | boolean | Yes |           |
|stores | cashier_sign_in_mode | text | Yes |                           |
|stores | created_at | timestamp with time zone | Yes |                 |
|stores | updated_at | timestamp with time zone | Yes |                 |
|transactions | id | uuid | No |                                        |
|transactions | user_id | uuid | No |                                   |
|transactions | items | jsonb | No |                                    |
|transactions | total | numeric | No |                                  |
|transactions | payment_method | text | No |                            |
|transactions | cashier_name | text | No |                              |
|transactions | customer | jsonb | Yes |                                |
|transactions | created_at | timestamp with time zone | No |            |
|transactions | store_id | uuid | Yes |                                 |
|transactions | cashier_user_id | uuid | Yes |                          |
|user_roles | id | uuid | No |                                          |
|user_roles | user_id | uuid | No |                                     |
|user_roles | store_id | uuid | No |                                    |
|user_roles | role | USER-DEFINED | No |                                |
|user_roles | invited_by | uuid | Yes |                                 |
|user_roles | invited_at | timestamp with time zone | Yes |             |
|user_roles | accepted_at | timestamp with time zone | Yes |            |

## 2. Storage Buckets
| Bucket ID | Public? | Size Limit | MIME Types |
|---|---|---|---|
|products | Public | Unlimited | All |

## 3. Security Policies (RLS)
| Schema | Table | Policy Name | Permissive | Roles | Command |
|---|---|---|---|---|---|
|public | activities | Store members can create activities | PERMISSIVE | authenticated | INSERT |                   |
|public | activities | Store members can view activities | PERMISSIVE | authenticated | SELECT |                     |
|public | activities | Users can create their own activities | PERMISSIVE | public | INSERT |                        |
|public | activities | Users can view their own activities | PERMISSIVE | public | SELECT |                          |
|public | admin_settings | Allow public read of admin email for PIN reset | PERMISSIVE | public | SELECT |           |
|public | admin_settings | Users can only access their own admin settings | PERMISSIVE | public | ALL |              |
|public | categories | Owners and managers can manage categories | PERMISSIVE | authenticated | ALL |                |
|public | categories | Store members can view categories | PERMISSIVE | authenticated | SELECT |                     |
|public | categories | Users can create their own categories | PERMISSIVE | public | INSERT |                        |
|public | categories | Users can delete their own categories | PERMISSIVE | public | DELETE |                        |
|public | categories | Users can update their own categories | PERMISSIVE | public | UPDATE |                        |
|public | categories | Users can view their own categories | PERMISSIVE | public | SELECT |                          |
|public | otp_codes | Allow public insert of OTP codes for PIN reset | PERMISSIVE | public | INSERT |                |
|public | otp_codes | Allow public read of OTP codes for verification | PERMISSIVE | public | SELECT |               |
|public | otp_codes | Allow public update of OTP codes to mark used | PERMISSIVE | public | UPDATE |                 |
|public | otp_codes | Service role can manage otp_codes | PERMISSIVE | public | ALL |                                |
|public | otp_codes | Users can only access their own OTP codes | PERMISSIVE | public | ALL |                        |
|public | pin_reset_attempts | Service role can manage all reset attempts | PERMISSIVE | public | ALL |              |
|public | pin_reset_attempts | Users can create their own reset attempts | PERMISSIVE | public | INSERT |            |
|public | pin_reset_attempts | Users can update their own reset attempts | PERMISSIVE | public | UPDATE |            |
|public | pin_reset_attempts | Users can view their own reset attempts | PERMISSIVE | public | SELECT |              |
|public | products | Owners and managers can manage products | PERMISSIVE | authenticated | ALL |                    |
|public | products | Store members can view products | PERMISSIVE | authenticated | SELECT |                         |
|public | products | Users can create their own products | PERMISSIVE | public | INSERT |                            |
|public | products | Users can delete their own products | PERMISSIVE | public | DELETE |                            |
|public | products | Users can update their own products | PERMISSIVE | public | UPDATE |                            |
|public | products | Users can view their own products | PERMISSIVE | public | SELECT |                              |
|public | profiles | Users can insert their own profile | PERMISSIVE | public | INSERT |                             |
|public | profiles | Users can update their own profile | PERMISSIVE | public | UPDATE |                             |
|public | profiles | Users can view their own profile | PERMISSIVE | public | SELECT |                               |
|public | store_invitations | Anyone can view their own invitations by email | PERMISSIVE | authenticated | SELECT | |
|public | store_invitations | Store owners can manage invitations | PERMISSIVE | authenticated | ALL |               |
|public | stores | Store members can view stores | PERMISSIVE | authenticated | SELECT |                             |
|public | stores | Store owners can manage their stores | PERMISSIVE | authenticated | ALL |                         |
|public | transactions | Cashiers can create transactions | PERMISSIVE | authenticated | INSERT |                    |
|public | transactions | Owners and managers can manage transactions | PERMISSIVE | authenticated | ALL |            |
|public | transactions | Store members can view transactions | PERMISSIVE | authenticated | SELECT |                 |
|public | transactions | Users can create their own transactions | PERMISSIVE | public | INSERT |                    |
|public | transactions | Users can view their own transactions | PERMISSIVE | public | SELECT |                      |
|public | user_roles | Store owners can manage roles in their stores | PERMISSIVE | authenticated | ALL |            |
|public | user_roles | Store owners can view all roles in their stores | PERMISSIVE | authenticated | SELECT |       |
|public | user_roles | Users can view their own roles | PERMISSIVE | authenticated | SELECT |                        |
|storage | objects | Users can delete their own product images | PERMISSIVE | public | DELETE |                      |
|storage | objects | Users can update their own product images | PERMISSIVE | public | UPDATE |                      |
|storage | objects | Users can upload their own product images | PERMISSIVE | public | INSERT |                      |
|storage | objects | Users can view their own product images | PERMISSIVE | public | SELECT |                        |