"use client";

import { useState } from "react";

export function useLocalList<T extends { id: string }>(initialItems: T[]) {
  const [items, setItems] = useState<T[]>(initialItems);

  function remove(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function update(id: string, patch: Partial<T>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function prepend(item: T) {
    setItems((current) => [item, ...current]);
  }

  return { items, setItems, prepend, remove, update };
}
