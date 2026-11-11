import { promptRegistry } from "./registry.js"

// Meal planning prompt
promptRegistry.register({
  name: "picnic_meal_planner",
  description: "Create a meal plan and generate a shopping list for Picnic",
  arguments: [
    {
      name: "days",
      description: "Number of days to plan meals for",
      required: false,
    },
    {
      name: "people",
      description: "Number of people to cook for",
      required: false,
    },
    {
      name: "dietary_restrictions",
      description: "Any dietary restrictions or preferences",
      required: false,
    },
  ],
  handler: async (args) => {
    const days = args?.days || "7"
    const people = args?.people || "2"
    const dietaryRestrictions = args?.dietary_restrictions || "none"

    return {
      messages: [
        {
          role: "system" as const,
          content: {
            type: "text" as const,
            text: "You are a meal planning expert with access to Picnic's grocery delivery service. Help create practical meal plans and shopping lists.",
          },
        },
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Create a ${days}-day meal plan for ${people} people. Dietary restrictions: ${dietaryRestrictions}. Use picnic_search to find ingredients and picnic_add_to_cart to build the shopping list.`,
          },
        },
      ],
    }
  },
})

// Budget shopping prompt
promptRegistry.register({
  name: "picnic_budget_shopping",
  description: "Help create a budget-conscious shopping list with Picnic",
  arguments: [
    {
      name: "budget",
      description: "Weekly grocery budget in euros",
      required: true,
    },
    {
      name: "household_size",
      description: "Number of people in the household",
      required: false,
    },
  ],
  handler: async (args) => {
    const budget = args?.budget || "100"
    const householdSize = args?.household_size || "2"

    return {
      messages: [
        {
          role: "system" as const,
          content: {
            type: "text" as const,
            text: "You are a budget-conscious shopping expert with access to Picnic's online supermarket. Help maximize grocery budgets while maintaining nutritional quality.",
          },
        },
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Create a budget-conscious shopping list for €${budget} per week for ${householdSize} people. Use picnic_search to find budget-friendly staples and picnic_add_to_cart to build the list while tracking costs.`,
          },
        },
      ],
    }
  },
})

// Quick dinner solutions prompt
promptRegistry.register({
  name: "picnic_quick_dinner",
  description: "Find ingredients for quick and easy dinner solutions available on Picnic",
  arguments: [
    {
      name: "time_limit",
      description: "Maximum cooking time in minutes",
      required: false,
    },
    {
      name: "dietary_preferences",
      description: "Any dietary preferences or restrictions",
      required: false,
    },
  ],
  handler: async (args) => {
    const timeLimit = args?.time_limit || "30"
    const dietaryPreferences = args?.dietary_preferences || "none"

    return {
      messages: [
        {
          role: "system" as const,
          content: {
            type: "text" as const,
            text: "You are a quick-cooking expert with access to Picnic's grocery delivery service. Focus on fast, practical recipes for busy people.",
          },
        },
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Find dinner solutions that can be prepared in ${timeLimit} minutes or less. Dietary preferences: ${dietaryPreferences}. Use picnic_search to find ingredients and ready-made solutions, then add the best option to cart.`,
          },
        },
      ],
    }
  },
})

// Healthy eating prompt
promptRegistry.register({
  name: "picnic_healthy_eating",
  description: "Create a healthy eating plan with products available on Picnic",
  arguments: [
    {
      name: "health_goal",
      description: "Specific health goal (weight loss, muscle gain, heart health, etc.)",
      required: false,
    },
    {
      name: "food_allergies",
      description: "Any food allergies or intolerances",
      required: false,
    },
  ],
  handler: async (args) => {
    const healthGoal = args?.health_goal || "general wellness"
    const foodAllergies = args?.food_allergies || "none"

    return {
      messages: [
        {
          role: "system" as const,
          content: {
            type: "text" as const,
            text: "You are a nutrition-focused shopping advisor with access to Picnic's online supermarket. Focus on whole foods and balanced nutrition.",
          },
        },
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Help me transition to healthier eating for ${healthGoal}. Food allergies: ${foodAllergies}. Use picnic_search to find healthy alternatives and nutritious products, then add a week's worth of healthy staples to cart.`,
          },
        },
      ],
    }
  },
})

// Special occasion shopping prompt
promptRegistry.register({
  name: "picnic_special_occasion",
  description: "Plan shopping for special occasions and gatherings using Picnic",
  arguments: [
    {
      name: "occasion",
      description: "Type of occasion (birthday party, dinner party, holiday meal, BBQ, etc.)",
      required: true,
    },
    {
      name: "guest_count",
      description: "Number of guests expected",
      required: false,
    },
  ],
  handler: async (args) => {
    const occasion = args?.occasion || "dinner party"
    const guestCount = args?.guest_count || "6-8"

    return {
      messages: [
        {
          role: "system" as const,
          content: {
            type: "text" as const,
            text: "You are an event planning expert with access to Picnic's grocery delivery service. Help create memorable occasions with great food.",
          },
        },
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Plan shopping for a ${occasion} for ${guestCount} people. Use picnic_search to find ingredients for appetizers, main courses, sides, and desserts. Add everything to cart and provide preparation timeline.`,
          },
        },
      ],
    }
  },
})

// Pantry restocking prompt
promptRegistry.register({
  name: "picnic_pantry_restock",
  description: "Help restock pantry essentials and household items through Picnic",
  arguments: [
    {
      name: "household_type",
      description: "Type of household (single person, couple, family with kids, etc.)",
      required: false,
    },
    {
      name: "cooking_frequency",
      description: "How often you cook at home",
      required: false,
    },
  ],
  handler: async (args) => {
    const householdType = args?.household_type || "small household"
    const cookingFrequency = args?.cooking_frequency || "regularly"

    return {
      messages: [
        {
          role: "system" as const,
          content: {
            type: "text" as const,
            text: "You are a household organization expert with access to Picnic's grocery delivery service. Help maintain well-stocked pantries and kitchens.",
          },
        },
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Help restock pantry essentials for a ${householdType} that cooks ${cookingFrequency}. Use picnic_search to find pantry staples, household necessities, and versatile ingredients. Add appropriate quantities to cart.`,
          },
        },
      ],
    }
  },
})

// Order management prompt
promptRegistry.register({
  name: "picnic_order_management",
  description: "Help manage Picnic orders, deliveries, and account settings",
  arguments: [
    {
      name: "task",
      description: "Specific task (check order status, manage delivery, review past orders, etc.)",
      required: false,
    },
  ],
  handler: async (args) => {
    const task = args?.task || "general order management"

    return {
      messages: [
        {
          role: "system" as const,
          content: {
            type: "text" as const,
            text: "You are a customer service expert with access to all Picnic account management tools. Help users manage their grocery delivery orders efficiently.",
          },
        },
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Help me with ${task} for my Picnic account. Use tools like picnic_get_cart, picnic_get_deliveries, picnic_get_delivery_slots, and picnic_get_user_details to provide comprehensive assistance.`,
          },
        },
      ],
    }
  },
})

// Recipe recreation prompt
promptRegistry.register({
  name: "picnic_recipe_recreation",
  description: "Help recreate a specific recipe using ingredients available on Picnic",
  arguments: [
    {
      name: "recipe_name",
      description: "Name of the recipe to recreate",
      required: true,
    },
    {
      name: "recipe_description",
      description: "Description or details about the recipe",
      required: false,
    },
    {
      name: "servings",
      description: "Number of servings needed",
      required: false,
    },
  ],
  handler: async (args) => {
    const recipeName = args?.recipe_name || "unknown recipe"
    const recipeDescription = args?.recipe_description || "no additional details"
    const servings = args?.servings || "4"

    return {
      messages: [
        {
          role: "system" as const,
          content: {
            type: "text" as const,
            text: "You are a culinary expert with access to Picnic's grocery delivery service. Help users recreate recipes by finding the right ingredients and providing cooking guidance.",
          },
        },
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Help me recreate "${recipeName}" for ${servings} servings. Additional details: ${recipeDescription}. Use picnic_search to find all necessary ingredients, suggest substitutions if needed, and add everything to cart. Provide step-by-step cooking instructions.`,
          },
        },
      ],
    }
  },
})

// Dietary substitution prompt
promptRegistry.register({
  name: "picnic_dietary_substitutions",
  description: "Find dietary substitutions and alternatives available on Picnic",
  arguments: [
    {
      name: "original_ingredient",
      description: "The ingredient that needs to be substituted",
      required: true,
    },
    {
      name: "dietary_need",
      description: "Reason for substitution (vegan, gluten-free, low-sodium, etc.)",
      required: true,
    },
    {
      name: "recipe_context",
      description: "What the ingredient is being used for",
      required: false,
    },
  ],
  handler: async (args) => {
    const originalIngredient = args?.original_ingredient || "unknown ingredient"
    const dietaryNeed = args?.dietary_need || "dietary restriction"
    const recipeContext = args?.recipe_context || "general cooking"

    return {
      messages: [
        {
          role: "system" as const,
          content: {
            type: "text" as const,
            text: "You are a dietary specialist with access to Picnic's grocery delivery service. Help users find suitable ingredient substitutions for their dietary needs.",
          },
        },
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `I need a ${dietaryNeed} substitute for ${originalIngredient} in ${recipeContext}. Use picnic_search to find suitable alternatives available on Picnic, explain how to use them, and add the best options to cart.`,
          },
        },
      ],
    }
  },
})

// Delivery optimization prompt
promptRegistry.register({
  name: "picnic_delivery_optimization",
  description: "Help optimize Picnic delivery scheduling and order timing",
  arguments: [
    {
      name: "schedule_preference",
      description: "Preferred delivery schedule (morning, afternoon, evening, specific days)",
      required: false,
    },
    {
      name: "household_needs",
      description: "Household consumption patterns and needs",
      required: false,
    },
  ],
  handler: async (args) => {
    const schedulePreference = args?.schedule_preference || "flexible"
    const householdNeeds = args?.household_needs || "standard household"

    return {
      messages: [
        {
          role: "system" as const,
          content: {
            type: "text" as const,
            text: "You are a logistics expert with access to Picnic's delivery system. Help users optimize their delivery schedule and order timing for maximum convenience.",
          },
        },
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Help me optimize my Picnic delivery schedule. Preferences: ${schedulePreference}. Household needs: ${householdNeeds}. Use picnic_get_delivery_slots to check availability, review my delivery history with picnic_get_deliveries, and suggest the best ordering and delivery strategy.`,
          },
        },
      ],
    }
  },
})
