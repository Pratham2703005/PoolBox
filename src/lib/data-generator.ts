import type { Field, OutputFormat, Template, TemplateField } from '@/types/data-generator';

// Predefined data pools
export const NAMES = {
  first: ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon', 'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy', 'Nicholas', 'Shirley', 'Eric', 'Angela', 'Jonathan', 'Helen', 'Stephen', 'Anna', 'Larry', 'Brenda', 'Justin', 'Pamela', 'Scott', 'Nicole', 'Brandon', 'Emma', 'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Raymond', 'Christine', 'Gregory', 'Debra', 'Frank', 'Rachel', 'Alexander', 'Catherine', 'Patrick', 'Carolyn', 'Raymond', 'Janet', 'Jack', 'Ruth', 'Dennis', 'Maria', 'Jerry', 'Heather'],
  last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster']
};

export const ADDRESSES = {
  streets: ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Elm St', 'Pine Rd', 'Washington Blvd', 'Park Ave', 'Lincoln Way', 'Lake Dr', 'River Rd', 'Hill St', 'Forest Ave', 'Sunset Blvd', 'Valley Rd', 'Spring St', 'Church St', 'School Rd', 'Market St', 'Mill Rd', 'Bridge St', 'High St', 'Grove Ave', 'Meadow Ln', 'Garden St', 'Pleasant St', 'Woodland Dr', 'Hillside Ave', 'Lakeview Dr', 'Riverside Dr'],
  cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Boston', 'Portland', 'Nashville', 'Oklahoma City', 'Las Vegas', 'Detroit', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque'],
  states: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']
};

export const LOREM_WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'];

export const GRADES = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
export const GENDERS = ['Male', 'Female', 'Other'];

export const TEMPLATES: Template[] = [
  {
    name: 'User Profile',
    fields: [
      { name: 'name', type: 'string', stringType: 'fullName' },
      { name: 'email', type: 'string', stringType: 'email', emailDomain: '@gmail.com' },
      { name: 'age', type: 'number', min: 18, max: 80 },
      { name: 'address', type: 'string', stringType: 'address' }
    ]
  },
  {
    name: 'Product',
    fields: [
      { name: 'productName', type: 'string', stringType: 'text', minWords: 2, maxWords: 4 },
      { name: 'price', type: 'number', min: 10, max: 1000, decimals: 2 },
      { name: 'description', type: 'string', stringType: 'paragraph', minWords: 20, maxWords: 50 },
      { name: 'inStock', type: 'boolean' }
    ]
  },
  {
    name: 'Student Record',
    fields: [
      { name: 'firstName', type: 'string', stringType: 'firstName' },
      { name: 'lastName', type: 'string', stringType: 'lastName' },
      { name: 'studentId', type: 'number', min: 1000, max: 9999 },
      { name: 'email', type: 'string', stringType: 'email', emailDomain: '@university.edu' },
      { name: 'marks', type: 'number', min: 0, max: 100 },
      { name: 'grade', type: 'string', stringType: 'grade', minWords: 1, maxWords: 1 }
    ]
  }
];

// Utility functions
export const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const randomInt = (min: number, max: number): number => 
  Math.floor(Math.random() * (max - min + 1)) + min;

export const generateLoremWords = (count: number): string => {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(random(LOREM_WORDS));
  }
  return words.join(' ');
};

export const generateLoremSentence = (wordCount: number = randomInt(8, 15)): string => {
  const sentence = generateLoremWords(wordCount);
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
};

export const generateLoremParagraph = (wordCount: number = randomInt(30, 80)): string => {
  const sentenceCount = Math.ceil(wordCount / 10);
  const sentences: string[] = [];
  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateLoremSentence());
  }
  return sentences.join(' ').split(' ').slice(0, wordCount).join(' ') + '.';
};

export const generateEmail = (name: string, domain: string = '@gmail.com'): string => {
  const username = name.toLowerCase().replace(/\s+/g, '.') + randomInt(1, 999);
  return username + domain;
};

export const generateAddress = (): string => {
  const num = randomInt(100, 9999);
  const street = random(ADDRESSES.streets);
  const city = random(ADDRESSES.cities);
  const state = random(ADDRESSES.states);
  const zip = randomInt(10000, 99999);
  return `${num} ${street}, ${city}, ${state} ${zip}`;
};

export const generatePhone = (): string => {
  return `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
};

export const generatePassword = (alphabets: number = 8, numbers: number = 2, symbols: number = 2): string => {
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let password = '';
  
  // Add alphabets (mix of upper and lower)
  for (let i = 0; i < alphabets; i++) {
    if (Math.random() > 0.5) {
      password += upperCase[Math.floor(Math.random() * upperCase.length)];
    } else {
      password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
    }
  }
  
  // Add numbers
  for (let i = 0; i < numbers; i++) {
    password += digits[Math.floor(Math.random() * digits.length)];
  }
  
  // Add symbols
  for (let i = 0; i < symbols; i++) {
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

export const generateValueForField = (
  field: Field,
  allFields: Field[] = [], // eslint-disable-line @typescript-eslint/no-unused-vars
  currentRecord: Record<string, string | number | boolean> = {}
): string | number | boolean => {
  if (field.type === 'boolean') {
    return Math.random() > 0.5;
  }

  if (field.type === 'number') {
    // Check if this is a marks/score/percentage field and if grade exists
    const fieldNameLower = field.name.toLowerCase();
    if (fieldNameLower === 'marks' || fieldNameLower === 'score' || fieldNameLower === 'percentage') {
      const grade = getFieldValue(currentRecord, 'grade', 'Grade') as string;
      
      if (grade) {
        // Reverse-calculate marks from grade
        let min = field.min;
        let max = field.max;
        
        switch (grade.toUpperCase()) {
          case 'S': min = Math.max(min, 90); max = Math.min(max, 100); break;
          case 'A': min = Math.max(min, 80); max = Math.min(max, 89); break;
          case 'B': min = Math.max(min, 70); max = Math.min(max, 79); break;
          case 'C': min = Math.max(min, 60); max = Math.min(max, 69); break;
          case 'D': min = Math.max(min, 50); max = Math.min(max, 59); break;
          case 'E': min = Math.max(min, 40); max = Math.min(max, 49); break;
          case 'F': min = Math.max(min, 0); max = Math.min(max, 39); break;
        }
        
        const value = randomInt(min, max);
        if (field.decimals > 0) {
          return parseFloat((value + Math.random()).toFixed(field.decimals));
        }
        return value;
      }
    }
    
    // Regular number generation
    const value = randomInt(field.min, field.max);
    if (field.decimals > 0) {
      return parseFloat((value + Math.random()).toFixed(field.decimals));
    }
    return value;
  }

  // String type
  let value = '';
  
  // Check if this is a firstName-type field (by name, not just stringType)
  const fieldNameLower = field.name.toLowerCase();
  const isFirstNameField = ['first', 'firstname', 'first_name'].includes(fieldNameLower) || field.stringType === 'firstName';
  const isLastNameField = ['last', 'lastname', 'last_name'].includes(fieldNameLower) || field.stringType === 'lastName';
  const isFullNameField = ['fullname', 'full_name', 'name'].includes(fieldNameLower) || field.stringType === 'fullName';
  
  if (isFirstNameField) {
    // If fullName exists, extract first name
    const fullName = getFieldValue(currentRecord, 'fullName', 'fullname', 'full_name', 'name') as string;
    if (fullName) {
      value = fullName.split(' ')[0];
    } else {
      value = random(NAMES.first);
    }
    return value;
  }
  
  if (isLastNameField) {
    // If fullName exists, extract last name
    const fullName = getFieldValue(currentRecord, 'fullName', 'fullname', 'full_name', 'name') as string;
    if (fullName) {
      const parts = fullName.split(' ');
      value = parts[parts.length - 1];
    } else {
      value = random(NAMES.last);
    }
    return value;
  }
  
  if (isFullNameField) {
    // Check if firstName and/or lastName fields exist in the record
    const firstName = getFieldValue(currentRecord, 'firstName', 'firstname', 'first_name', 'first') as string;
    const lastName = getFieldValue(currentRecord, 'lastName', 'lastname', 'last_name', 'last') as string;
    
    if (firstName && lastName) {
      value = `${firstName} ${lastName}`;
    } else if (firstName) {
      value = `${firstName} ${random(NAMES.last)}`;
    } else if (lastName) {
      value = `${random(NAMES.first)} ${lastName}`;
    } else {
      value = `${random(NAMES.first)} ${random(NAMES.last)}`;
    }
    return value;
  }
  
  switch (field.stringType) {
    case 'firstName': {
      // Already handled above
      value = random(NAMES.first);
      break;
    }
    case 'lastName': {
      // Already handled above
      value = random(NAMES.last);
      break;
    }
    case 'fullName': {
      // Already handled above
      value = `${random(NAMES.first)} ${random(NAMES.last)}`;
      break;
    }
    case 'email': {
      // Try to use firstName from record if available (check all variations including 'first')
      let emailBase = getFieldValue(currentRecord, 'firstName', 'firstname', 'first_name', 'first') as string;
      if (!emailBase) {
        emailBase = random(NAMES.first);
      }
      value = generateEmail(emailBase, field.emailDomain);
      break;
    }
    case 'phone':
      value = generatePhone();
      break;
    case 'address':
      value = generateAddress();
      break;
    case 'city':
      value = random(ADDRESSES.cities);
      break;
    case 'state':
      value = random(ADDRESSES.states);
      break;
    case 'grade': {
      // Check if marks/score field exists in the record
      const marks = getFieldValue(currentRecord, 'marks', 'score', 'percentage') as number;
      
      if (marks !== undefined && typeof marks === 'number') {
        // Calculate grade based on marks
        if (marks >= 90) value = 'S';
        else if (marks >= 80) value = 'A';
        else if (marks >= 70) value = 'B';
        else if (marks >= 60) value = 'C';
        else if (marks >= 50) value = 'D';
        else if (marks >= 40) value = 'E';
        else value = 'F';
      } else {
        value = random(GRADES);
      }
      break;
    }
    case 'gender':
      value = random(GENDERS);
      break;
    case 'password':
      value = generatePassword(
        field.passwordAlphabets || 8,
        field.passwordNumbers || 2,
        field.passwordSymbols || 2
      );
      break;
    case 'paragraph':
      const paraWords = randomInt(field.minWords, field.maxWords);
      value = generateLoremParagraph(paraWords);
      break;
    case 'sentence':
      const sentWords = randomInt(field.minWords, field.maxWords);
      value = generateLoremSentence(sentWords);
      break;
    case 'text':
    default:
      const wordCount = randomInt(field.minWords, field.maxWords);
      value = generateLoremWords(wordCount);
      value = value.charAt(0).toUpperCase() + value.slice(1);
      break;
  }

  // Apply prefix/suffix
  if (field.startsWith) {
    value = field.startsWith + value;
  }
  if (field.endsWith) {
    value = value + field.endsWith;
  }

  return value;
};

// Helper function to check if a field is dependent on other fields
const getFieldDependencies = (field: Field): string[] => {
  const dependencies: string[] = [];
  const fieldNameLower = field.name.toLowerCase();
  
  // Check if this is a firstName-type field
  if (['first', 'firstname', 'first_name'].includes(fieldNameLower) || field.stringType === 'firstName') {
    dependencies.push('fullName', 'fullname', 'full_name', 'name');
  }
  
  // Check if this is a lastName-type field
  if (['last', 'lastname', 'last_name'].includes(fieldNameLower) || field.stringType === 'lastName') {
    dependencies.push('fullName', 'fullname', 'full_name', 'name');
  }
  
  switch (field.stringType) {
    case 'fullName':
      dependencies.push('firstName', 'firstname', 'first_name', 'first', 'lastName', 'lastname', 'last_name', 'last');
      break;
    case 'email':
      dependencies.push('firstName', 'firstname', 'first_name', 'first');
      break;
    case 'grade':
      dependencies.push('marks', 'score', 'percentage');
      break;
  }
  
  // Check for marks/score/percentage fields that depend on grade
  if (field.type === 'number') {
    if (fieldNameLower === 'marks' || fieldNameLower === 'score' || fieldNameLower === 'percentage') {
      dependencies.push('grade', 'Grade');
    }
  }
  
  return dependencies;
};

// Helper function to check if a field provides data for other fields
const isSourceField = (fieldName: string): boolean => {
  const lowerName = fieldName.toLowerCase();
  return ['firstname', 'first_name', 'first', 'lastname', 'last_name', 'last', 'fullname', 'full_name', 'name', 'marks', 'score', 'percentage', 'grade'].includes(lowerName) ||
         fieldName === 'firstName' || fieldName === 'lastName' || fieldName === 'fullName';
};

// Sort fields so source fields come before dependent fields
const sortFieldsByDependency = (fields: Field[]): Field[] => {
  const sourceFields: Field[] = [];
  const dependentFields: Field[] = [];
  const regularFields: Field[] = [];
  
  for (const field of fields) {
    if (!field.name.trim()) continue;
    
    const dependencies = getFieldDependencies(field);
    if (dependencies.length > 0) {
      dependentFields.push(field);
    } else if (isSourceField(field.name)) {
      sourceFields.push(field);
    } else {
      regularFields.push(field);
    }
  }
  
  return [...sourceFields, ...regularFields, ...dependentFields];
};

// Helper to get normalized field value from record
const getFieldValue = (record: Record<string, string | number | boolean>, ...fieldNames: string[]): string | number | boolean | undefined => {
  for (const name of fieldNames) {
    if (record[name] !== undefined) {
      return record[name];
    }
  }
  return undefined;
};

export const generateData = (fields: Field[], count: number, format: OutputFormat): string => {
  if (fields.length === 0) {
    throw new Error('Please add at least one field');
  }

  const results: Record<string, string | number | boolean>[] = [];
  
  // Sort fields to ensure source fields are generated before dependent fields
  const sortedFields = sortFieldsByDependency(fields);

  for (let i = 0; i < count; i++) {
    const obj: Record<string, string | number | boolean> = {};
    
    // Two-pass generation for better correlation
    // Pass 1: Generate base/source fields (firstName, lastName, marks, etc.)
    for (const field of sortedFields) {
      if (field.name.trim()) {
        obj[field.name] = generateValueForField(field, sortedFields, obj);
      }
    }
    
    results.push(obj);
  }

  // Format output
  if (format === 'json') {
    return JSON.stringify(results, null, 2);
  } else if (format === 'csv') {
    if (results.length === 0) return '';
    const headers = Object.keys(results[0]);
    const rows = results.map(obj => 
      headers.map(h => {
        const val = obj[h];
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      }).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  } else if (format === 'sql') {
    if (results.length === 0) return '';
    const tableName = 'generated_data';
    const headers = Object.keys(results[0]);
    const inserts = results.map(obj => {
      const values = headers.map(h => {
        const val = obj[h];
        return typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val;
      }).join(', ');
      return `INSERT INTO ${tableName} (${headers.join(', ')}) VALUES (${values});`;
    });
    return inserts.join('\n');
  }

  return '';
};

export const createFieldFromTemplate = (f: TemplateField, idx: number): Field => ({
  id: Date.now() + idx,
  name: f.name,
  type: f.type,
  stringType: f.stringType || 'text',
  minWords: f.minWords || 5,
  maxWords: f.maxWords || 15,
  min: f.min || 1,
  max: f.max || 100,
  decimals: f.decimals || 0,
  startsWith: f.startsWith || '',
  endsWith: f.endsWith || '',
  emailDomain: f.emailDomain || '@gmail.com',
  passwordAlphabets: f.passwordAlphabets || 8,
  passwordNumbers: f.passwordNumbers || 2,
  passwordSymbols: f.passwordSymbols || 2
});

export const createEmptyField = (): Field => ({
  id: Date.now(),
  name: '',
  type: 'string',
  stringType: 'text',
  minWords: 5,
  maxWords: 15,
  min: 1,
  max: 100,
  decimals: 0,
  startsWith: '',
  endsWith: '',
  emailDomain: '@gmail.com',
  passwordAlphabets: 8,
  passwordNumbers: 2,
  passwordSymbols: 2
});
