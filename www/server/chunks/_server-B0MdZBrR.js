const data = [
  {
    id: "b01",
    name: "Egg + Spinach Scramble",
    mealType: "breakfast",
    portions: {
      protein_palms: 1.5,
      veg_fists: 2,
      starch_fists: 0,
      fat_thumbs: 1,
      fruit_fists: 0
    },
    ingredients: [
      {
        name: "eggs",
        amount: 3,
        unit: "count"
      },
      {
        name: "spinach",
        amount: 2,
        unit: "fist"
      },
      {
        name: "onion",
        amount: 0.5,
        unit: "fist"
      },
      {
        name: "olive oil",
        amount: 1,
        unit: "thumb"
      }
    ],
    steps: [
      "Sauté onion 2–3 min in oil",
      "Add spinach to wilt",
      "Scramble in eggs; season"
    ],
    tags: [
      "quick",
      "gluten-free"
    ]
  },
  {
    id: "b02",
    name: "Salmon + Cucumber Bowl",
    mealType: "breakfast",
    portions: {
      protein_palms: 1.5,
      veg_fists: 1,
      starch_fists: 1,
      fat_thumbs: 1,
      fruit_fists: 0
    },
    ingredients: [
      {
        name: "salmon",
        amount: 1.5,
        unit: "palm"
      },
      {
        name: "cucumber",
        amount: 1,
        unit: "fist"
      },
      {
        name: "rice (dry)",
        amount: 1,
        unit: "fist"
      },
      {
        name: "sesame oil",
        amount: 1,
        unit: "thumb"
      }
    ],
    steps: [
      "Cook salmon 10–12 min",
      "Cook rice",
      "Slice cucumber; dress with oil/salt",
      "Serve bowl"
    ],
    tags: [
      "batch-protein",
      "gluten-free"
    ]
  },
  {
    id: "l01",
    name: "Chicken Thigh Bowl",
    mealType: "lunch",
    portions: {
      protein_palms: 1.5,
      veg_fists: 2,
      starch_fists: 1,
      fat_thumbs: 0.5,
      fruit_fists: 0
    },
    ingredients: [
      {
        name: "chicken thighs",
        amount: 1.5,
        unit: "palm"
      },
      {
        name: "brown rice (dry)",
        amount: 1,
        unit: "fist"
      },
      {
        name: "cucumber",
        amount: 1,
        unit: "fist"
      },
      {
        name: "broccoli",
        amount: 1,
        unit: "fist"
      }
    ],
    steps: [
      "Roast/pan chicken",
      "Cook rice",
      "Steam broccoli; slice cucumber; assemble"
    ],
    tags: [
      "bowl",
      "gluten-free"
    ]
  },
  {
    id: "l02",
    name: "Carnitas Salad",
    mealType: "lunch",
    portions: {
      protein_palms: 1.5,
      veg_fists: 2.5,
      starch_fists: 0,
      fat_thumbs: 1,
      fruit_fists: 0
    },
    ingredients: [
      {
        name: "carnitas",
        amount: 1.5,
        unit: "palm"
      },
      {
        name: "lettuce",
        amount: 1.5,
        unit: "fist"
      },
      {
        name: "avocado",
        amount: 0.5,
        unit: "thumb"
      },
      {
        name: "onion",
        amount: 0.5,
        unit: "fist"
      }
    ],
    steps: [
      "Warm carnitas",
      "Chop lettuce/onion; slice avocado",
      "Toss with salsa/olive oil"
    ],
    tags: [
      "salad",
      "gluten-free"
    ]
  },
  {
    id: "d01",
    name: "Ribeye + Broccolini",
    mealType: "dinner",
    portions: {
      protein_palms: 1.5,
      veg_fists: 2,
      starch_fists: 0,
      fat_thumbs: 0.3,
      fruit_fists: 0
    },
    ingredients: [
      {
        name: "ribeye",
        amount: 1.5,
        unit: "palm"
      },
      {
        name: "broccolini",
        amount: 2,
        unit: "fist"
      },
      {
        name: "olive oil",
        amount: 0.3,
        unit: "thumb"
      }
    ],
    steps: [
      "Sear ribeye 3–4 min/side; rest",
      "Roast broccolini 400°F 10–12 min"
    ],
    tags: [
      "steak-night",
      "gluten-free"
    ]
  }
];
const GET = async () => {
  return new Response(JSON.stringify(data), { headers: { "content-type": "application/json" } });
};

export { GET };
//# sourceMappingURL=_server-B0MdZBrR.js.map
