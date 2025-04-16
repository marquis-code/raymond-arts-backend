// import * as handlebars from 'handlebars';

// export function registerHandlebarsHelpers() {
//   // Format currency
//   handlebars.registerHelper('formatCurrency', function(value) {
//     if (value === undefined || value === null) return '$0.00';
//     return new Intl.NumberFormat('en-US', { 
//       style: 'currency', 
//       currency: 'USD' 
//     }).format(value);
//   });

//   // Format date
//   handlebars.registerHelper('formatDate', function(date) {
//     if (!date) return '';
//     const dateObj = new Date(date);
//     return dateObj.toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'long', 
//       day: 'numeric' 
//     });
//   });

//   // Truncate text
//   handlebars.registerHelper('truncate', function(text, length) {
//     if (!text) return '';
//     if (text.length <= length) return text;
//     return text.substring(0, length) + '...';
//   });

//   // Multiply values
//   handlebars.registerHelper('multiply', function(a, b) {
//     return a * b;
//   });

//   // Conditional
//   handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
//     return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
//   });

//   // Each with index
//   handlebars.registerHelper('eachWithIndex', function(array, options) {
//     let buffer = '';
//     for (let i = 0; i < array.length; i++) {
//       const item = array[i];
//       item.index = i;
//       buffer += options.fn(item);
//     }
//     return buffer;
//   });
// }

// import * as handlebars from 'handlebars';

// export function registerHandlebarsHelpers() {
//   // Allow Handlebars to access properties from Mongoose objects
//   // This is needed because Mongoose objects are not plain JavaScript objects
//   const originalCompile = handlebars.compile;
//   handlebars.compile = function(input, options) {
//     return originalCompile(input, {
//       ...options,
//       allowProtoPropertiesByDefault: true,
//       allowProtoMethodsByDefault: true
//     });
//   };

//   // Format currency
//   handlebars.registerHelper('formatCurrency', function(value) {
//     if (value === undefined || value === null) return '$0.00';
//     return new Intl.NumberFormat('en-US', { 
//       style: 'currency', 
//       currency: 'USD' 
//     }).format(value);
//   });

//   // Format date
//   handlebars.registerHelper('formatDate', function(date) {
//     if (!date) return '';
//     const dateObj = new Date(date);
//     return dateObj.toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'long', 
//       day: 'numeric' 
//     });
//   });

//   // Truncate text
//   handlebars.registerHelper('truncate', function(text, length) {
//     if (!text) return '';
//     if (text.length <= length) return text;
//     return text.substring(0, length) + '...';
//   });

//   // Multiply values
//   handlebars.registerHelper('multiply', function(a, b) {
//     return a * b;
//   });

//   // Conditional
//   handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
//     return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
//   });

//   // Each with index
//   handlebars.registerHelper('eachWithIndex', function(array, options) {
//     let buffer = '';
//     for (let i = 0; i < array.length; i++) {
//       const item = array[i];
//       item.index = i;
//       buffer += options.fn(item);
//     }
//     return buffer;
//   });
// }

import * as Handlebars from 'handlebars';
import { create } from 'handlebars';

export function registerHandlebarsHelpers() {
  // Create a new instance of Handlebars with custom runtime options
  const customHandlebars = create();
  
  // Set runtime options to allow Mongoose object properties
  const originalRuntime = customHandlebars.create;
  customHandlebars.create = function() {
    const runtime = originalRuntime.call(this);
    runtime.allowProtoPropertiesByDefault = true;
    runtime.allowProtoMethodsByDefault = true;
    return runtime;
  };

  // Format currency
  customHandlebars.registerHelper('formatCurrency', function(value) {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(value);
  });

  // Format date
  customHandlebars.registerHelper('formatDate', function(date) {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  });

  // Truncate text
  customHandlebars.registerHelper('truncate', function(text, length) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  });

  // Multiply values
  customHandlebars.registerHelper('multiply', function(a, b) {
    return a * b;
  });

  // Conditional
  customHandlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });

  // Each with index
  customHandlebars.registerHelper('eachWithIndex', function(array, options) {
    let buffer = '';
    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      item.index = i;
      buffer += options.fn(item);
    }
    return buffer;
  });

  // Also register the helpers on the default Handlebars instance
  // so they're available if someone uses the default instance
  Handlebars.registerHelper('formatCurrency', customHandlebars.helpers.formatCurrency);
  Handlebars.registerHelper('formatDate', customHandlebars.helpers.formatDate);
  Handlebars.registerHelper('truncate', customHandlebars.helpers.truncate);
  Handlebars.registerHelper('multiply', customHandlebars.helpers.multiply);
  Handlebars.registerHelper('ifEquals', customHandlebars.helpers.ifEquals);
  Handlebars.registerHelper('eachWithIndex', customHandlebars.helpers.eachWithIndex);

  // Return the custom Handlebars instance
  return customHandlebars;
}

// Alternative approach using a utility function
export function createHandlebarsTemplate(templateString: string) {
  // Create a template using the default Handlebars instance
  const template = Handlebars.compile(templateString);
  
  // Return a function that renders the template with the proper runtime options
  return function(context: any, options?: any) {
    return template(context, {
      ...options,
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    });
  };
}