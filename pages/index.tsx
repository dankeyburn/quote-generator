import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import React, { useEffect, useState } from "react";

// Components
import {
  BackgroundImage1,
  BackgroundImage2,
  FooterCon,
  FooterLink,
  GenerateQuoteButton,
  GenerateQuoteButtonText,
  GradientBackgroundCon,
  QuoteGeneratorCon,
  QuoteGeneratorInnerCon,
  QuoteGeneratorSubTitle,
  QuoteGeneratorTitle,
} from "@/components/QuoteGenerator/QuoteGeneratorElements";

// Assets
import Clouds1 from "../assets/cloud-and-thunder.png";
import Clouds2 from "../assets/cloudy-weather.png";
import { API } from "aws-amplify";
import { quotesQueryName } from "@/src/graphql/queries";
import { GraphQLResult } from "@aws-amplify/api-graphql";

// Interface for our DynamoDB object
interface UpdateQuoteInfoData {
  id: string;
  queryName: string;
  quotesGenerated: number;
  createdAt: string;
  updatedAt: string;
}

// Type guard for our fetch function
function isGraphQLResultForquotesQueryName(
  response: any
): response is GraphQLResult<{
  quotesQueryName: {
    items: [UpdateQuoteInfoData];
  };
}> {
  return (
    response.data &&
    response.data.quotesQueryName &&
    response.data.quotesQueryName.items
  );
}

export default function Home() {
  const [numberOfQuotes, setNumberOfQuotes] = useState<Number | null>(0);

  // Function to fetch out DynamoDB object (quotes generated)
  const updateQuoteInfo = async () => {
    try {
      const response = await API.graphql<UpdateQuoteInfoData>({
        query: quotesQueryName,
        authMode: "AWS_IAM",
        variables: {
          queryName: "LIVE",
        },
      });
      // console.log("response", response);

      // Create type guards
      if (!isGraphQLResultForquotesQueryName(response)) {
        throw new Error("Unexpected response from API.graphql");
      }
      if (!response.data) {
        throw new Error("Response data is undefined");
      }
      const receivedNumberOfQuotes =
        response.data.quotesQueryName.items[0].quotesGenerated;
      setNumberOfQuotes(receivedNumberOfQuotes);
    } catch (error) {
      console.log("error getting quote data: ", error);
    }
  };

  useEffect(() => {
    updateQuoteInfo();
  }, []);

  return (
    <>
      <Head>
        <title>Quote Generator</title>
        <meta name="description" content="A project to generate quotes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background */}
      <GradientBackgroundCon>
        {/* Quote Generator Modal Pop-Up*/}
        {/* <QuoteGeneratorModal /> */}

        {/* Quote Generator */}
        <QuoteGeneratorCon>
          <QuoteGeneratorInnerCon>
            <QuoteGeneratorTitle>Daily Quote Generator</QuoteGeneratorTitle>
            <QuoteGeneratorSubTitle>
              Get your inspiration here with a quote provided by{" "}
              <FooterLink
                href="https://zenquotes.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                ZenQuotes Api
              </FooterLink>
            </QuoteGeneratorSubTitle>
            <GenerateQuoteButton>
              <GenerateQuoteButtonText>
                {/* onClick={null}> */}
                Generate a Quote
              </GenerateQuoteButtonText>
            </GenerateQuoteButton>
          </QuoteGeneratorInnerCon>
        </QuoteGeneratorCon>

        {/* Background Images */}
        <BackgroundImage1 src={Clouds1} height="300" alt="cloudybackground1" />

        <BackgroundImage2 src={Clouds2} height="300" alt="cloudybackground1" />

        {/* Footer */}
        <FooterCon>
          <>Quotes Generated: {numberOfQuotes}</>
          <br />
          Developed by{" "}
          <FooterLink
            href="https://dankeyburn.github.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            Dan Keyburn
          </FooterLink>
        </FooterCon>
      </GradientBackgroundCon>
    </>
  );
}
