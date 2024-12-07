import { DataExport, ValidationError, SCHEMA_DEFINITIONS } from './types';

function validateDataType(value: any, expectedType: string | string[]): boolean {
  if (Array.isArray(expectedType)) {
    return expectedType.includes(value);
  }
  
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'date':
      return !isNaN(Date.parse(value));
    default:
      return true;
  }
}

function validateObject(obj: any, schema: any): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check required fields
  for (const field of schema.required) {
    if (!(field in obj)) {
      errors.push({
        field,
        message: `Required field '${field}' is missing`
      });
    }
  }

  // Check field types
  for (const [field, expectedType] of Object.entries(schema.types)) {
    if (field in obj && !validateDataType(obj[field], expectedType as string | string[])) {
      errors.push({
        field,
        message: `Invalid type for field '${field}'. Expected ${expectedType}, got ${typeof obj[field]}`,
        value: obj[field]
      });
    }
  }

  return errors;
}

export function validateImportData(data: DataExport): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate metadata
  if (!data.metadata) {
    errors.push({
      field: 'metadata',
      message: 'Missing metadata section'
    });
  } else {
    if (!data.metadata.version) {
      errors.push({
        field: 'metadata.version',
        message: 'Missing version in metadata'
      });
    }
    if (!data.metadata.timestamp) {
      errors.push({
        field: 'metadata.timestamp',
        message: 'Missing timestamp in metadata'
      });
    }
  }

  // Validate data section
  if (!data.data) {
    errors.push({
      field: 'data',
      message: 'Missing data section'
    });
    return errors;
  }

  // Validate transactions
  if (Array.isArray(data.data.transactions)) {
    data.data.transactions.forEach((transaction, index) => {
      const transactionErrors = validateObject(transaction, SCHEMA_DEFINITIONS.transaction);
      transactionErrors.forEach(error => {
        errors.push({
          field: `transactions[${index}].${error.field}`,
          message: error.message,
          value: error.value
        });
      });
    });
  } else {
    errors.push({
      field: 'transactions',
      message: 'Transactions must be an array'
    });
  }

  // Validate products
  if (Array.isArray(data.data.products)) {
    data.data.products.forEach((product, index) => {
      const productErrors = validateObject(product, SCHEMA_DEFINITIONS.product);
      productErrors.forEach(error => {
        errors.push({
          field: `products[${index}].${error.field}`,
          message: error.message,
          value: error.value
        });
      });
    });
  } else {
    errors.push({
      field: 'products',
      message: 'Products must be an array'
    });
  }

  // Validate customers
  if (Array.isArray(data.data.customers)) {
    data.data.customers.forEach((customer, index) => {
      const customerErrors = validateObject(customer, SCHEMA_DEFINITIONS.customer);
      customerErrors.forEach(error => {
        errors.push({
          field: `customers[${index}].${error.field}`,
          message: error.message,
          value: error.value
        });
      });
    });
  } else {
    errors.push({
      field: 'customers',
      message: 'Customers must be an array'
    });
  }

  return errors;
}