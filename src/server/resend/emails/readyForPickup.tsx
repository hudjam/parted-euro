import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";
import type { OrderWithItems } from "../../../utils/trpc";

type ReadyForPickupEmailprops = {
  order: OrderWithItems;
};

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const ReadyForPickupEmail = ({
  order,
}: ReadyForPickupEmailprops) => (
  <Html>
    <Head />
    <Preview>Your order is ready for pickup!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${baseUrl}/public/logo.png`}
          width="160"
          height="32"
          alt="Notion's Logo"
        />
        <Text style={{ ...text }}>Hi {order!.name}</Text>
        <Text style={{ ...text, marginBottom: "14px" }}>
          Great News! Your order is ready for Pickup!
        </Text>
        <Text style={{ ...text, marginBottom: "14px" }}>
          To arrange a pickup from our warehouse, please contact us directly and
          we can organize a time with you. Parted Euro is strictly open via
          appointment only and not open for public walk-ins.
        </Text>
        <Text style={{ ...text }}>Contact us via:</Text>
        <Text style={{ ...text }}>Email: contact@partedeuro.com.au</Text>
        <Text style={{ ...text, marginBottom: "14px" }}>
          Call / Text: 0431 133 764
        </Text>
        <Text style={{ ...text }}>
          Below is a summary of your order: {order!.xeroInvoiceId}
        </Text>
        {order!.orderItems.map((item) => (
          <Container key={item.id} style={container}>
            <Text style={{ ...text }}>Line {item.listing.title}</Text>
            <Text style={{ ...text, marginBottom: "14px" }}>
              {item.listing.price / 100}
            </Text>
          </Container>
        ))}
        <Text style={{ ...text, marginBottom: "14px" }}>
          Thanks for shopping at Parted Euro!
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ReadyForPickupEmail;

const main = {
  backgroundColor: "#ffffff",
};

const container = {
  paddingLeft: "12px",
  paddingRight: "12px",
  margin: "0 auto",
};

const h1 = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const link = {
  color: "#2754C5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  textDecoration: "underline",
};

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  margin: "24px 0",
};

const footer = {
  color: "#898989",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "12px",
  lineHeight: "22px",
  marginTop: "12px",
  marginBottom: "24px",
};

const code = {
  display: "inline-block",
  padding: "16px 4.5%",
  width: "90.5%",
  backgroundColor: "#f4f4f4",
  borderRadius: "5px",
  border: "1px solid #eee",
  color: "#333",
};
