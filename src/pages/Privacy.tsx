import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import PullToRefresh from "@/components/PullToRefresh";
import { Separator } from "@/components/ui/separator";

const Privacy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <PullToRefresh onRefresh={() => Promise.resolve()}>
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="border border-border"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <p className="text-sm font-medium text-primary">
                  Privacy Policy
                </p>
                <h1 className="text-3xl font-bold text-foreground">
                  How Quik Shopping protects your data
                </h1>
              </div>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Privacy at a glance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Quik Shopping is built to help small retail stores manage
                  inventory, sales, and team access securely. We collect only
                  the information required to operate the app, support
                  authentication, and maintain store records.
                </p>
                <p>
                  This Privacy Policy explains what information we collect, how
                  we use it, and how you can manage your data.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Information We Collect
                </h2>
                <p className="text-sm text-muted-foreground">
                  We may collect account details such as your email, user name,
                  and store metadata to enable authentication and store
                  management. Transaction records, product data, and activity
                  logs are stored to keep your POS operations working.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  How We Use Your Data
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your data is used to authenticate users, authorize roles, sync
                  store inventory, and display transaction history. We do not
                  use your store data for advertising or third-party profiling.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Storage and Security
                </h2>
                <p className="text-sm text-muted-foreground">
                  Data is stored through Supabase on secure cloud
                  infrastructure. Access controls and row-level security protect
                  store-level data and limit access to authorized users only.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Your Rights
                </h2>
                <p className="text-sm text-muted-foreground">
                  You can sign out, delete your account where supported, and
                  request changes to your store profile. For questions about
                  data usage, contact the app administrator or the team that
                  manages your deployment.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Third-Party Services
                </h2>
                <p className="text-sm text-muted-foreground">
                  Quik Shopping may depend on third-party services such as
                  Supabase for hosting, authentication, and storage. These
                  services process data only to the extent necessary to provide
                  the app.
                </p>
              </section>

              <Separator className="bg-border" />

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Effective date: June 11, 2026.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/terms")}
                  className="w-full justify-center"
                >
                  View Terms of Service
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PullToRefresh>
    </Layout>
  );
};

export default Privacy;
