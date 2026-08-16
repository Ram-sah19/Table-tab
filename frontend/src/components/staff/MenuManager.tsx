import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  saveFoodServerFn,
  deleteFoodServerFn,
  createCategoryServerFn,
  deleteCategoryServerFn,
} from "@/lib/api";
import { categoriesQuery, foodsQuery, type Food } from "@/lib/menu";
import { money } from "@/lib/store";

const foodSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300),
  price: z.number().min(0).max(100000),
  prep_time: z.number().int().min(1).max(180),
  calories: z.number().int().min(0).max(5000),
  ingredients: z.string().trim().max(300),
  image_url: z.string().trim().max(500),
});

type Draft = {
  id?: string;
  name: string;
  description: string;
  category_id: string;
  price: string;
  prep_time: string;
  calories: string;
  ingredients: string;
  image_url: string;
  is_veg: boolean;
  is_available: boolean;
  is_special: boolean;
  is_popular: boolean;
  spice_level: number;
};

const emptyDraft: Draft = {
  name: "",
  description: "",
  category_id: "",
  price: "0",
  prep_time: "15",
  calories: "350",
  ingredients: "",
  image_url: "",
  is_veg: true,
  is_available: true,
  is_special: false,
  is_popular: false,
  spice_level: 1,
};

export function MenuManager() {
  const queryClient = useQueryClient();
  const { data: foods = [] } = useQuery(foodsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [newCategory, setNewCategory] = useState("");

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["foods"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const openEdit = (food: Food) =>
    setDraft({
      id: food.id,
      name: food.name,
      description: food.description,
      category_id: food.category_id ?? "",
      price: String(food.price),
      prep_time: String(food.prep_time),
      calories: String(food.calories),
      ingredients: food.ingredients,
      image_url: food.image_url ?? "",
      is_veg: food.is_veg,
      is_available: food.is_available,
      is_special: food.is_special,
      is_popular: food.is_popular,
      spice_level: food.spice_level,
    });

  const save = async () => {
    if (!draft) return;
    const parsed = foodSchema.safeParse({
      name: draft.name,
      description: draft.description,
      price: Number(draft.price),
      prep_time: Number(draft.prep_time),
      calories: Number(draft.calories),
      ingredients: draft.ingredients,
      image_url: draft.image_url,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the fields");
      return;
    }
    const payload = {
      ...parsed.data,
      image_url: parsed.data.image_url || undefined,
      category_id: draft.category_id || undefined,
      is_veg: draft.is_veg,
      is_available: draft.is_available,
      is_special: draft.is_special,
      is_popular: draft.is_popular,
      spice_level: draft.spice_level,
    };
    try {
      await saveFoodServerFn({
        data: {
          id: draft.id,
          ...payload,
        },
      });
      toast.success(draft.id ? "Dish updated" : "Dish added");
      setDraft(null);
      refresh();
    } catch {
      toast.error("Could not save the dish");
    }
  };

  const remove = async (food: Food) => {
    try {
      await deleteFoodServerFn({ data: { id: food.id } });
      toast.success("Dish removed");
      refresh();
    } catch {
      toast.error("Could not delete");
    }
  };

  const toggleField = async (food: Food, field: "is_available" | "is_special") => {
    const patch =
      field === "is_available"
        ? { is_available: !food.is_available }
        : { is_special: !food.is_special };
    try {
      await saveFoodServerFn({
        data: {
          id: food.id,
          name: food.name,
          price: food.price,
          ...patch,
        },
      });
      refresh();
    } catch {
      toast.error("Could not update");
    }
  };

  const addCategory = async () => {
    const name = newCategory.trim();
    if (name.length < 2) return;
    try {
      await createCategoryServerFn({ data: { name } });
      setNewCategory("");
      toast.success("Category added");
      refresh();
    } catch {
      toast.error("Category already exists or could not be added");
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border bg-card p-4 shadow-soft">
        <h3 className="font-display text-xl">Categories</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold">
              {c.name}
              <button
                onClick={async () => {
                  try {
                    await deleteCategoryServerFn({ data: { id: c.id } });
                    refresh();
                  } catch {
                    toast.error("Could not delete category");
                  }
                }}
                aria-label={`Delete ${c.name}`}
              >
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={newCategory}
            maxLength={40}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category"
            className="min-w-0 flex-1 rounded-full border bg-background px-4 py-2 text-sm outline-none"
          />
          <button
            onClick={() => void addCategory()}
            className="gradient-ember shrink-0 rounded-full px-4 py-2 text-xs font-bold text-primary-foreground"
          >
            Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h3 className="truncate font-display text-xl">Dishes ({foods.length})</h3>
        <button
          onClick={() => setDraft(emptyDraft)}
          className="gradient-ember inline-flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-xs font-bold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add food
        </button>
      </div>

      <ul className="space-y-3">
        {foods.map((food) => (
          <li key={food.id} className="flex gap-3 rounded-3xl border bg-card p-3 shadow-soft">
            <img
              src={food.image_url ?? "/images/hero.jpg"}
              alt={food.name}
              loading="lazy"
              width={200}
              height={200}
              className="h-20 w-20 shrink-0 rounded-2xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-start justify-between gap-2">
                <p className="truncate font-bold">{food.name}</p>
                <span className="shrink-0 font-display text-lg">{money(Number(food.price))}</span>
              </div>
              <p className="truncate text-xs text-muted-foreground">{food.description}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
                <button
                  onClick={() => void toggleField(food, "is_available")}
                  className={
                    food.is_available
                      ? "rounded-full bg-success px-3 py-1 text-success-foreground"
                      : "rounded-full bg-destructive px-3 py-1 text-destructive-foreground"
                  }
                >
                  {food.is_available ? "Available" : "Out of stock"}
                </button>
                <button
                  onClick={() => void toggleField(food, "is_special")}
                  className={
                    food.is_special
                      ? "gradient-ember rounded-full px-3 py-1 text-primary-foreground"
                      : "rounded-full border px-3 py-1 text-muted-foreground"
                  }
                >
                  Today's special
                </button>
                <button onClick={() => openEdit(food)} className="rounded-full border px-3 py-1">
                  <Pencil className="mr-1 inline h-3 w-3" /> Edit
                </button>
                <button
                  onClick={() => void remove(food)}
                  className="rounded-full border px-3 py-1 text-destructive"
                >
                  <Trash2 className="mr-1 inline h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={!!draft} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl sm:max-w-lg">
          <DialogTitle className="font-display text-2xl">
            {draft?.id ? "Edit dish" : "New dish"}
          </DialogTitle>
          {draft && (
            <div className="space-y-3">
              <Field label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
              <Field
                label="Description"
                value={draft.description}
                onChange={(v) => setDraft({ ...draft, description: v })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price" value={draft.price} onChange={(v) => setDraft({ ...draft, price: v })} />
                <Field
                  label="Prep time (min)"
                  value={draft.prep_time}
                  onChange={(v) => setDraft({ ...draft, prep_time: v })}
                />
                <Field
                  label="Calories"
                  value={draft.calories}
                  onChange={(v) => setDraft({ ...draft, calories: v })}
                />
                <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Category
                  <select
                    value={draft.category_id}
                    onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}
                    className="mt-1 w-full rounded-2xl border bg-background px-3 py-2.5 text-sm font-medium tracking-normal text-foreground"
                  >
                    <option value="">Uncategorised</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <Field
                label="Ingredients"
                value={draft.ingredients}
                onChange={(v) => setDraft({ ...draft, ingredients: v })}
              />
              <Field
                label="Image URL"
                value={draft.image_url}
                onChange={(v) => setDraft({ ...draft, image_url: v })}
              />
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {(
                  [
                    ["is_veg", "Veg"],
                    ["is_available", "Available"],
                    ["is_special", "Special"],
                    ["is_popular", "Popular"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setDraft({ ...draft, [key]: !draft[key] })}
                    className={
                      draft[key]
                        ? "gradient-ember rounded-full px-3 py-1.5 text-primary-foreground"
                        : "rounded-full border px-3 py-1.5 text-muted-foreground"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Spice level: {draft.spice_level}
                <input
                  type="range"
                  min={0}
                  max={3}
                  value={draft.spice_level}
                  onChange={(e) => setDraft({ ...draft, spice_level: Number(e.target.value) })}
                  className="mt-2 w-full accent-primary"
                />
              </label>
              <button
                onClick={() => void save()}
                className="gradient-ember w-full rounded-full py-3 text-sm font-bold text-primary-foreground shadow-glow"
              >
                Save dish
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
      {label}
      <input
        value={value}
        maxLength={300}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-2xl border bg-background px-3 py-2.5 text-sm font-medium tracking-normal text-foreground outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
