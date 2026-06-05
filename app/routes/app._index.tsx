import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  Banner,
  BlockStack,
  InlineStack,
  Badge,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const install = await prisma.aimlInstall.findUnique({
    where: { shop: session.shop },
  });
  return json({ shop: session.shop, install });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "re-index") {
    const install = await prisma.aimlInstall.findUnique({
      where: { shop: session.shop },
    });
    if (install?.websiteId) {
      const apiUrl = process.env.AIML_API_URL ?? "https://api.aiml.chat";
      await fetch(`${apiUrl}/v1/websites/${install.websiteId}/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AIML_SERVICE_TOKEN}`,
        },
        body: JSON.stringify({ startUrl: `https://${session.shop}` }),
      });
      return json({ success: true, message: "Re-indexing started." });
    }
  }
  return json({ success: false });
};

export default function Index() {
  const { shop, install } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const isIndexing = fetcher.state !== "idle";

  const isActive = install && !install.uninstalledAt;

  return (
    <Page title="AIML Chat">
      <Layout>
        <Layout.Section>
          {isActive ? (
            <Banner tone="success">
              <p>Widget is active on <strong>{shop}</strong>. Visitors can now ask questions about your store.</p>
            </Banner>
          ) : (
            <Banner tone="warning">
              <p>Setup is in progress. Please wait a moment for indexing to complete.</p>
            </Banner>
          )}
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Status</Text>
              <InlineStack gap="300" align="start">
                <Text as="span" tone="subdued">Website ID:</Text>
                <Text as="span">{install?.websiteId ?? "—"}</Text>
              </InlineStack>
              <InlineStack gap="300" align="start">
                <Text as="span" tone="subdued">Status:</Text>
                <Badge tone={isActive ? "success" : "attention"}>
                  {isActive ? "Active" : "Pending"}
                </Badge>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Content Indexing</Text>
              <Text as="p" tone="subdued">
                AIML Chat indexes your products, pages, and policies so the widget can answer customer questions.
                Trigger a manual re-index after significant content changes.
              </Text>
              <fetcher.Form method="post">
                <input type="hidden" name="action" value="re-index" />
                <Button submit loading={isIndexing} disabled={!isActive}>
                  Re-index store content
                </Button>
              </fetcher.Form>
              {fetcher.data?.success && (
                <Banner tone="success"><p>Re-indexing started.</p></Banner>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Widget Integration</Text>
              <Text as="p" tone="subdued">
                The AIML Chat widget is injected automatically via the Theme App Extension.
                It appears as a floating chat button on all storefront pages.
              </Text>
              <Text as="p" tone="subdued">
                To customise the widget (colours, position, greeting message), visit your{" "}
                <a href="https://aiml.chat/dashboard" target="_blank" rel="noopener noreferrer">
                  AIML.chat dashboard
                </a>.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">What your assistant can do</Text>
              <Text as="p" tone="subdued">• Answers grounded only in your store content — with clickable source links, no hallucinations.</Text>
              <Text as="p" tone="subdued">• Captures a customer's email when it can't answer, so you never lose a lead.</Text>
              <Text as="p" tone="subdued">• Shows suggested questions and an auto-generated FAQ when the chat opens.</Text>
              <Text as="p" tone="subdued">• See top questions and unanswered queries in your{" "}
                <a href="https://aiml.chat/dashboard" target="_blank" rel="noopener noreferrer">analytics dashboard</a>.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
