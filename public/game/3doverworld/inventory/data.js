// inventory/data.js

export const INITIAL_ITEMS = [
  {
    name: "Wood",
    quantity: 50,
    type: "resource",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/wood_icon.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Basic building material for construction.",
    cost: 2
  },
  {
    name: "Health Potion",
    quantity: 3,
    type: "tool",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/small_health_potion.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Restores a small amount of health.",
    cost: 10
  },
  {
    name: "Iron Axe",
    quantity: 1,
    type: "tool",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/iron_axe.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "A sturdy tool for chopping wood.",
    cost: 25
  },
  {
    name: "Bread",
    quantity: 5,
    type: "resource",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/bread.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Nutritious food that restores energy.",
    cost: 5
  },
  {
    name: "Gold Coin",
    quantity: 20,
    type: "resource",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/gold_coin.webp" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Currency used for trading and purchases.",
    cost: 1
  },
  {
    name: "Map",
    quantity: 1,
    type: "tool",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/map.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Reveals parts of the world and hidden locations.",
    cost: 15
  },
  {
    name: "Torch",
    quantity: 2,
    type: "tool",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/torch.webp" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Provides light in dark areas.",
    cost: 8
  },
  {
    name: "Arrow",
    quantity: 15,
    type: "tool",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/arrow.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Ammunition for ranged weapons.",
    cost: 2
  },
  {
    name: "Tiny Mana Potion",
    quantity: 5,
    type: "potion",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/tiny_mana_potion.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Restores a small amount of mana.",
    cost: 5
  },
  {
    name: "Medium Mana Potion",
    quantity: 3,
    type: "potion",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/medium_mana_potion.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Restores a moderate amount of mana.",
    cost: 10
  },
  {
    name: "Grand Mana Potion",
    quantity: 1,
    type: "potion",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/grand_mana_potion.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Restores a large amount of mana.",
    cost: 20
  },
  {
    name: "Grand Health Potion",
    quantity: 1,
    type: "potion",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/grand_health_potion.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Restores a large amount of health.",
    cost: 20
  },
  {
    name: "Medium Health Potion",
    quantity: 2,
    type: "potion",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/medium_health_potion.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Restores a moderate amount of health.",
    cost: 15
  },
  {
    name: "Greater Health Potion",
    quantity: 1,
    type: "potion",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/greater_health_potion.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Restores significant health.",
    cost: 18
  },
  {
    name: "Tiny Health Potion",
    quantity: 5,
    type: "potion",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/tiny_health_potion.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Restores a small amount of health.",
    cost: 5
  },
  {
    name: "Electronic Scraps",
    quantity: 8,
    type: "resource",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/electronic_scraps.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Useful for crafting electronic components.",
    cost: 3
  },
  {
    name: "Screw",
    quantity: 30,
    type: "resource",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/screw.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "A small metal fastener.",
    cost: 1
  },
  {
    name: "Rebar Rod",
    quantity: 5,
    type: "resource",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/rebar_rod.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "A heavy-duty metal rod used in construction.",
    cost: 10
  },
  {
    name: "Bone Fragments",
    quantity: 10,
    type: "resource",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/bone_fragments.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Remnants of bones, useful for crafting.",
    cost: 2
  },
  {
    name: "Cloth Scraps",
    quantity: 15,
    type: "resource",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/cloth_scraps.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Pieces of fabric for crafting or repairs.",
    cost: 2
  },
  {
    name: "Concrete Mix",
    quantity: 3,
    type: "resource",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/concrete_mix.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Material used for building and repairs.",
    cost: 12
  },
  {
    name: "Iron Scrap",
    quantity: 12,
    type: "resource",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/iron_scrap.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Pieces of scrap iron that can be recycled.",
    cost: 4
  },
  {
    name: "Aluminium Scrap",
    quantity: 7,
    type: "resource",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/aluminium_scrap.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Pieces of scrap aluminium, useful for crafting.",
    cost: 4
  },
  {
    name: "Glass Shards",
    quantity: 20,
    type: "resource",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/glass_shards.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Broken pieces of glass—handle with care.",
    cost: 2
  },
  {
    name: "Pile of Screws",
    quantity: 4,
    type: "resource",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/pile_of_screws.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "A bundle of screws, essential for repairs.",
    cost: 3
  },
  {
    name: "Plywood Sheets",
    quantity: 2,
    type: "resource",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/plywood_sheets.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Wood panels used in construction projects.",
    cost: 20
  },
  {
    name: "Charcoal",
    quantity: 1,
    type: "resource",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/charcoal.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Burnable carbon material for fueling fires.",
    cost: 7
  },
  {
    name: "Assorted Plastics",
    quantity: 10,
    type: "resource",
    icon: '<img src="https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/assorted_plastics.png" style="max-width:100%; max-height:100%; display:block; margin:0 auto;">',
    description: "Mixed plastic pieces for crafting and repairs.",
    cost: 2
  },
  {
    name: "Bronze Bar",
    quantity: 0,
    type: "resource",
    icon: '',
    description: "A bar of bronze metal.",
    cost: 15
  },
  {
    name: "Copper Bar",
    quantity: 0,
    type: "resource",
    icon: '',
    description: "A bar of copper metal.",
    cost: 10
  },
  {
    name: "Copper Ore",
    quantity: 0,
    type: "resource",
    icon: '',
    description: "Ore containing copper.",
    cost: 5
  },
  {
    name: "Tin Ore",
    quantity: 0,
    type: "resource",
    icon: '',
    description: "Ore containing tin.",
    cost: 5
  },
  {
    name: "Log",
    quantity: 0,
    type: "resource",
    icon: '',
    description: "A log of wood.",
    cost: 2
  }
];
