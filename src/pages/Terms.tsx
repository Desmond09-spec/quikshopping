import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import PullToRefresh from "@/components/PullToRefresh";
import { Separator } from "@/components/ui/separator";

const Terms: React.FC = () => {
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
                  Terms of Service
                </p>
                <h1 className="text-3xl font-bold text-foreground">
                  Using Quik Shopping responsibly
                </h1>
              </div>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Terms overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  These Terms govern your use of the Quik Shopping application.
                  By using the app, you agree to follow the rules below and to
                  keep your account secure.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Account and Access
                </h2>
                <p className="text-sm text-muted-foreground">
                  You are responsible for maintaining the security of your
                  account login information. Only authorized users should access
                  store data or make changes inside the app.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Permitted Use
                </h2>
                <p className="text-sm text-muted-foreground">
                  Quik Shopping is intended for managing retail store inventory,
                  sales, and team roles. Do not use it for unlawful activity,
                  spam, or to store prohibited content.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Data and Privacy
                </h2>
                <p className="text-sm text-muted-foreground">
                  The app may collect and store data needed to offer its
                  services, including store records, transaction history, and
                  user authentication information. Please review the Privacy
                  Policy to understand how data is handled.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Intellectual Property
                </h2>
                <p className="text-sm text-muted-foreground">
                  The application interface, branding, and implementation are
                  owned by the app provider. You may use the software only as
                  permitted by the owner and its licensing terms.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Liability and Support
                </h2>
                <p className="text-sm text-muted-foreground">
                  Quik Shopping is provided as-is. The app provider is not
                  responsible for losses arising from data errors, missed sales,
                  or operational interruptions. Always keep regular backups and
                  verify critical data before trusting it for business
                  decisions.
                </p>
              </section>

              <Separator className="bg-border" />

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Effective date: June 11, 2026.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/privacy")}
                  className="w-full justify-center"
                >
                  Read Privacy Policy
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PullToRefresh>
    </Layout>
  );
};

export default Terms;
