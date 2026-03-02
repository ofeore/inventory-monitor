"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export default function Connect() {
  const [textInput, setTextInput] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.href = `/api/shopify/install?shop=${textInput}`;
  }

  return (
    <main className="appContainer">
      <div className="card">
        <h1 className="pageTitle">Connect your Shopify store</h1>

        <p className="pageSubtitle">
          Enter your store domain below (example:
          inventory-monitor-dev.myshopify.com)
        </p>

        <form onSubmit={handleSubmit}>
          <input
            className="numberInput"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="inventory-monitor-dev.myshopify.com"
          />

          <br />

          <button className="primaryButton" type="submit">
            Connect Store
          </button>
        </form>
      </div>
    </main>
  );
}
