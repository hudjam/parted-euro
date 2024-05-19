import type { NextApiRequest, NextApiResponse } from "next";
import { sendOrderReadyForPickupEmail } from "../../../server/resend/resend";
import { OrderWithItems } from "../../../utils/trpc";

async function POST(req: NextApiRequest, res: NextApiResponse) {
  const { order } = JSON.parse(req.body) as Record<"order", OrderWithItems>;
  await sendOrderReadyForPickupEmail(order);
  res.status(200).send(`Email sent`);
}

export default POST;