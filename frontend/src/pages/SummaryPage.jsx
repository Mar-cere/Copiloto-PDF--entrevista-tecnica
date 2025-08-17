// src/pages/SummaryPage.jsx
import { useParams } from "react-router-dom";
import Summary from "../components/Summary";
import Header from "../components/Header";

export default function SummaryPage() {
  const { pdfName } = useParams();

  return (
    <>
      <Header />
      <Summary pdfName={pdfName} />
    </>
  );
}
