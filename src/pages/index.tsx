import { type NextPage } from "next";
import Head from "next/head";
import carImg from "../../public/car.jpg";
import { trpc } from "../utils/trpc";
import { useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import Select from "react-select";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button } from "../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const Home: NextPage = () => {
  const [carSelectOpen, setCarSelectOpen] = useState<boolean>(false);
  const [series, setSeries] = useState<string>("");
  const [generation, setGeneration] = useState<string>("");
  const [model, setModel] = useState<string>("");

  const router = useRouter();

  const cars = trpc.cars.getAllSeries.useQuery(undefined, {
  });

  const generations = trpc.cars.getMatchingGenerations.useQuery(
    { series },
    {
      enabled: series !== "",
    }
  );

  const models = trpc.cars.getMatchingModels.useQuery(
    { series, generation },
    {
      enabled: generation !== "",
    }
  );

  return (
    <>
      <Head>
        <title>Parted Euro</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col bg-white">
        <div className="flex w-full items-center justify-center">
          <Image
            src={carImg.src}
            alt="hero"
            className="h-[calc(100vh-5rem)] w-full object-cover"
            width={carImg.width}
            height={carImg.height}
            priority
          />
          <div className="absolute w-[50%] text-center text-white">
            <div className="flex w-full flex-col items-center">
              <AnimatePresence>
                {!carSelectOpen ? (
                  <motion.div
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    className={`absolute w-full duration-150 ease-linear`}
                  >
                    <h4 className="text-3xl">BMW Spare Parts Specialists</h4>
                    <p className="mt-2 text-xl">
                      Shop our wide range of second-hand parts from various
                      BMW&apos;s.
                    </p>
                    <div className="mt-4 flex justify-around flex-col gap-4 md:flex-row">
                      <Button
                        className="border-white text-sm text-white hidden md:visible"
                        variant="outline"
                        onClick={() => setCarSelectOpen(!carSelectOpen)}
                      >
                        SHOP BY CAR
                      </Button>
                      <Button
                        className="border-white text-sm text-white"
                        variant="outline"
                        onClick={() => router.push("/listings")}
                      >
                        BROWSE ALL
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    className={` absolute duration-150 ease-linear`}
                  >
                    <div className="mt-4 flex items-center justify-center text-black">
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          setCarSelectOpen(!carSelectOpen);
                          setSeries("");
                          setGeneration("");
                          setModel("");
                        }}
                      >
                        <BiArrowBack className="text-4xl text-white" />
                      </div>
                      <Select
                        instanceId="seriesSelect"
                        className="mx-4 w-36"
                        placeholder="Series"
                        options={cars.data?.series}
                        onChange={(e) => setSeries(e?.value || "")}
                      />
                      <Select
                        className="mx-4 w-36"
                        instanceId="generationSelect"
                        placeholder="Generation"
                        options={generations.data?.generations}
                        onChange={(e) => setGeneration(e?.value || "")}
                        isDisabled={!generations.data?.generations.length}
                      />
                      <Select
                        className="mx-4 w-36"
                        instanceId="modelSelect"
                        placeholder="Model"
                        options={models.data?.models}
                        onChange={(e) => setModel(e?.value || "")}
                        isDisabled={!models.data?.models.length}
                      />
                      <Button
                        onClick={() =>
                          router.push(
                            `/listings?series=${series}&generation=${generation}&model=${model}`
                          )
                        }
                        className="border-white text-sm text-white"
                        variant="outline"
                      >
                        Search
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center p-4">
          {/* {listings.data?.map((listing) => (
            <Link
            key={listing.id}
            className="group m-6 flex h-[740px] w-[22%] cursor-pointer flex-col justify-between"
            href={`listings/listing?id=${listing.id}`}
            >
              <div className="max-h-[634px]">
                <img
                  src={listing.images[0]?.url}
                  className="h-full duration-100 ease-linear group-hover:scale-105"
                  alt=""
                />
              </div>
              <div className="flex flex-col">
                <p className="max-w-fit border-b-2 border-transparent group-hover:border-b-2 group-hover:border-black">
                  {listing.title}
                </p>
                <p className="text-lg">
                  {formatter.format(listing.price / 100).split("A")[1]} AUD
                </p>
              </div>
            </Link>
          ))} */}
        </div>
      </main>
    </>
  );
};

export default Home;
