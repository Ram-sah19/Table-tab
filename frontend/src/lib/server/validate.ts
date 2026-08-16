// Lightweight validation helpers — no external packages needed

export type ValidationError = {
  field: string;
  message: string;
};

export class ValidationFailed extends Error {
  constructor(public errors: ValidationError[]) {
    super("Validation failed");
    this.name = "ValidationFailed";
  }
}

function err(field: string, message: string): ValidationError {
  return { field, message };
}

// --- Auth ---

export function validateLogin(body: unknown): { email: string; password: string } {
  const errors: ValidationError[] = [];
  const data = body as Record<string, unknown>;

  if (!data?.email || typeof data.email !== "string" || !data.email.includes("@")) {
    errors.push(err("email", "A valid email address is required"));
  }
  if (!data?.password || typeof data.password !== "string" || (data.password as string).length < 6) {
    errors.push(err("password", "Password must be at least 6 characters"));
  }

  if (errors.length) throw new ValidationFailed(errors);
  return { email: (data.email as string).toLowerCase().trim(), password: data.password as string };
}

export function validateRegister(body: unknown): {
  email: string;
  password: string;
  full_name: string;
} {
  const errors: ValidationError[] = [];
  const data = body as Record<string, unknown>;

  if (!data?.email || typeof data.email !== "string" || !data.email.includes("@")) {
    errors.push(err("email", "A valid email address is required"));
  }
  if (!data?.password || typeof data.password !== "string" || (data.password as string).length < 6) {
    errors.push(err("password", "Password must be at least 6 characters"));
  }
  if (data?.full_name && (data.full_name as string).length > 100) {
    errors.push(err("full_name", "Name must be under 100 characters"));
  }

  if (errors.length) throw new ValidationFailed(errors);
  return {
    email: (data.email as string).toLowerCase().trim(),
    password: data.password as string,
    full_name: ((data.full_name as string) || "").trim(),
  };
}

// --- Food ---

export function validateFood(body: unknown): Record<string, unknown> {
  const errors: ValidationError[] = [];
  const data = body as Record<string, unknown>;

  if (!data?.id) {
    // Create: name and price required
    if (!data?.name || typeof data.name !== "string" || (data.name as string).trim().length < 2) {
      errors.push(err("name", "Food name must be at least 2 characters"));
    }
    if (data?.price === undefined || data.price === null || isNaN(Number(data.price)) || Number(data.price) < 0) {
      errors.push(err("price", "Price must be a non-negative number"));
    }
  }

  if (data?.price !== undefined && Number(data.price) > 99999) {
    errors.push(err("price", "Price is unrealistically high"));
  }
  if (data?.prep_time !== undefined && (isNaN(Number(data.prep_time)) || Number(data.prep_time) < 1 || Number(data.prep_time) > 180)) {
    errors.push(err("prep_time", "Prep time must be between 1 and 180 minutes"));
  }
  if (data?.spice_level !== undefined && ![0, 1, 2, 3].includes(Number(data.spice_level))) {
    errors.push(err("spice_level", "Spice level must be 0–3"));
  }

  if (errors.length) throw new ValidationFailed(errors);
  return data;
}

// --- Category ---

export function validateCategory(body: unknown): { name: string; emoji?: string } {
  const errors: ValidationError[] = [];
  const data = body as Record<string, unknown>;

  if (!data?.name || typeof data.name !== "string" || (data.name as string).trim().length < 2) {
    errors.push(err("name", "Category name must be at least 2 characters"));
  }
  if ((data.name as string)?.length > 50) {
    errors.push(err("name", "Category name must be under 50 characters"));
  }

  if (errors.length) throw new ValidationFailed(errors);
  return { name: (data.name as string).trim(), emoji: data.emoji as string | undefined };
}

// --- Order ---

export function validateOrder(body: unknown): Record<string, unknown> {
  const errors: ValidationError[] = [];
  const data = body as Record<string, unknown>;

  if (!data?.customer_name || typeof data.customer_name !== "string" || (data.customer_name as string).trim().length < 2) {
    errors.push(err("customer_name", "Customer name must be at least 2 characters"));
  }
  if (!data?.table_number || typeof data.table_number !== "string" || !(data.table_number as string).trim()) {
    errors.push(err("table_number", "Table number is required"));
  }
  if (!Array.isArray(data?.items) || (data.items as unknown[]).length === 0) {
    errors.push(err("items", "Order must contain at least one item"));
  } else {
    for (const [i, item] of (data.items as unknown[]).entries()) {
      const it = item as Record<string, unknown>;
      if (!it?.name) errors.push(err(`items[${i}].name`, "Item name is required"));
      if (!it?.qty || Number(it.qty) < 1) errors.push(err(`items[${i}].qty`, "Item quantity must be at least 1"));
      if (it?.price === undefined || Number(it.price) < 0) errors.push(err(`items[${i}].price`, "Item price is required"));
    }
  }

  if (errors.length) throw new ValidationFailed(errors);
  return data;
}

// --- Order status ---
const VALID_STATUSES = ["received", "confirmed", "preparing", "ready", "served", "cancelled"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

export function validateOrderStatus(body: unknown): { status: OrderStatus } {
  const data = body as Record<string, unknown>;
  if (!data?.status || !VALID_STATUSES.includes(data.status as OrderStatus)) {
    throw new ValidationFailed([
      err("status", `Status must be one of: ${VALID_STATUSES.join(", ")}`),
    ]);
  }
  return { status: data.status as OrderStatus };
}

// --- Service request ---
const VALID_TYPES = ["waiter", "water", "bill", "cleaning"] as const;

export function validateServiceRequest(body: unknown): Record<string, unknown> {
  const errors: ValidationError[] = [];
  const data = body as Record<string, unknown>;

  if (!data?.table_number || typeof data.table_number !== "string" || !(data.table_number as string).trim()) {
    errors.push(err("table_number", "Table number is required"));
  }
  if (!data?.type || !VALID_TYPES.includes(data.type as (typeof VALID_TYPES)[number])) {
    errors.push(err("type", `Type must be one of: ${VALID_TYPES.join(", ")}`));
  }

  if (errors.length) throw new ValidationFailed(errors);
  return data;
}
