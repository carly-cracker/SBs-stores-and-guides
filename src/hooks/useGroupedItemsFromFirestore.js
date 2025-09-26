import { useEffect, useMemo, useState } from "react";
  import { collection, onSnapshot } from "firebase/firestore";

  /**
   * useGroupedItemsFromFirestore
   * Listens to a Firestore collection and groups items by category and subcategory.
   * Returns categories and groupedItems suitable for your Sidebar props.
   *
   * Assumes each document may contain:
   * - category (string) [or Category]
   * - subcategory (string) [or Subcategory, subCategory, SubCategory]
   *
   * Missing values default to "Uncategorized" and "General".
   *
   * @param {Object} params
   * @param {import('firebase/firestore').Firestore} params.db - Firestore instance
   * @param {string} [params.collectionName="items"] - Collection name to read
   * @param {Record<string, string[]>} [params.staticOptions] - Optional static categories/subcategories to ensure presence (e.g., seed defaults)
   *
   * @returns {{
   *   categories: string[],
   *   groupedItems: Record<string, Record<string, any[]>>,
   *   loading: boolean,
   *   error: Error | null
   * }}
   */
  export default function useGroupedItemsFromFirestore({
    db,
    collectionName = "items",
    staticOptions,
  }) {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      if (!db) return;

      const colRef = collection(db, collectionName);
      const unsub = onSnapshot(
        colRef,
        (snapshot) => {
          const next = [];
          snapshot.forEach((doc) => {
            next.push({ id: doc.id, ...doc.data() });
          });
          setDocs(next);
          setError(null);
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );

      return () => unsub();
    }, [db, collectionName]);

    const { groupedItems, categories } = useMemo(() => {
      // Build category -> subcategory -> [items]
      const grouped = {};
      for (const item of docs) {
        const rawCat = item.category ?? item.Category ?? "Uncategorized";
        const category =
          typeof rawCat === "string" && rawCat.trim()
            ? rawCat.trim()
            : "Uncategorized";

        const rawSub =
          item.subcategory ??
          item.Subcategory ??
          item.subCategory ??
          item.SubCategory ??
          "General";
        const subcategory =
          typeof rawSub === "string" && rawSub.trim() ? rawSub.trim() : "General";

        if (!grouped[category]) grouped[category] = {};
        if (!grouped[category][subcategory]) grouped[category][subcategory] = [];
        grouped[category][subcategory].push(item);
      }

      // Ensure static options exist too (optional)
      if (staticOptions && typeof staticOptions === "object") {
        for (const [cat, subs] of Object.entries(staticOptions)) {
          if (!grouped[cat]) grouped[cat] = {};
          const list = Array.isArray(subs) ? subs : [];
          if (list.length === 0) list.push("General");
          for (const sub of list) {
            if (!grouped[cat][sub]) grouped[cat][sub] = [];
          }
        }
      }

      // Sort subcategory keys for stable UI
      for (const cat of Object.keys(grouped)) {
        const sortedSubs = {};
        for (const sub of Object.keys(grouped[cat]).sort((a, b) =>
          a.localeCompare(b)
        )) {
          sortedSubs[sub] = grouped[cat][sub];
        }
        grouped[cat] = sortedSubs;
      }

      // Sorted categories
      const cats = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

      return { groupedItems: grouped, categories: cats };
    }, [docs, staticOptions]);

    return { categories, groupedItems, loading, error };
  }