"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export default function Connect() {
  const [textInput, setTextInput] = useState("");
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    window.location.href = `/api/shopify/install?shop=${textInput}`;
  }

  return (
    <div>
      <h1>Connect your Shopify store</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Paste the URL of your shop here without https://"
        ></input>
        <button type="submit">Connect</button>
      </form>
    </div>
  );
}
