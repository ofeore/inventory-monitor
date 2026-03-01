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
          placeholder="Type in your shop domain"
        ></input>
        <button type="submit">Connect</button>
      </form>
    </div>
  );
}
