import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import AddCar from "../../components/modals/AddCar";
import React from "react";

import { trpc } from "../../utils/trpc";
import OriginCard from "../../components/origins/OriginCard";

const Origins: NextPage = () => {

  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
      <Head>
        <title>Origins</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col bg-white">
        <div>
          <button>Add Origin</button>
        </div>
        <div className="flex w-full flex-wrap items-center justify-center p-8">

        </div>
      </main>
    </>
  );
};

export default Origins;
