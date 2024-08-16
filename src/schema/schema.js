const {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean,
} = require("graphql");

const DB = require("../db/crunchbase");

const OrganizationType = new GraphQLObjectType({
  name: "Organization",
  fields: () => ({
    uuid: {
      type: GraphQLString,
    },
    name: {
      type: GraphQLString,
    },
    type: {
      type: GraphQLString,
    },
    permalink: {
      type: GraphQLString,
    },
    cb_url: {
      type: GraphQLString,
    },
    rank: {
      type: GraphQLInt,
    },
    created_at: {
      type: GraphQLString,
    },
    updated_at: {
      type: GraphQLString,
    },
    legal_name: {
      type: GraphQLString,
    },
    roles: {
      type: GraphQLString,
    },
    domain: {
      type: GraphQLString,
    },
    homepage_url: {
      type: GraphQLString,
    },
    country_code: {
      type: GraphQLString,
    },
    state_code: {
      type: GraphQLString,
    },
    region: {
      type: GraphQLString,
    },
    city: {
      type: GraphQLString,
    },
    address: {
      type: GraphQLString,
    },
    postal_code: {
      type: GraphQLString,
    },
    status: {
      type: GraphQLString,
    },
    short_description: {
      type: GraphQLString,
    },
    category_list: {
      type: GraphQLString,
    },
    category_groups_list: {
      type: GraphQLString,
    },
    num_funding_rounds: {
      type: GraphQLInt,
    },
    total_funding_usd: {
      type: GraphQLInt,
    },
    total_funding: {
      type: GraphQLInt,
    },
    total_funding_currency_code: {
      type: GraphQLString,
    },
    founded_on: {
      type: GraphQLString,
    },
    last_funding_on: {
      type: GraphQLString,
    },
    closed_on: {
      type: GraphQLString,
    },
    employee_count: {
      type: GraphQLString,
    },
    email: {
      type: GraphQLString,
    },
    phone: {
      type: GraphQLString,
    },
    facebook_url: {
      type: GraphQLString,
    },
    linkedin_url: {
      type: GraphQLString,
    },
    twitter_url: {
      type: GraphQLString,
    },
    logo_url: {
      type: GraphQLString,
    },
    alias1: {
      type: GraphQLString,
    },
    alias2: {
      type: GraphQLString,
    },
    alias3: {
      type: GraphQLString,
    },
    primary_role: {
      type: GraphQLString,
    },
    num_exits: {
      type: GraphQLInt,
    },
    funding_rounds: {
      type: new GraphQLList(FundingRoundType),
      resolve(parent, args) {
        return DB.select().from("funding_rounds").where("org_uuid", parent.uuid);
      },
    },
    funds: {
      type: new GraphQLList(FundType),
      resolve(parent, args) {
        return DB.select().from("funds").where("entity_uuid", parent.uuid);
      },
    },
  }),
});

const FundingRoundType = new GraphQLObjectType({
  name: "FundingRound",
  fields: () => ({
    uuid: {
      type: GraphQLString,
    },
    name: {
      type: GraphQLString,
    },
    type: {
      type: GraphQLString,
    },
    permalink: {
      type: GraphQLString,
    },
    cb_url: {
      type: GraphQLString,
    },
    rank: {
      type: GraphQLInt,
    },
    created_at: {
      type: GraphQLString,
    },
    updated_at: {
      type: GraphQLString,
    },
    country_code: {
      type: GraphQLString,
    },
    state_code: {
      type: GraphQLString,
    },
    region: {
      type: GraphQLString,
    },
    city: {
      type: GraphQLString,
    },

    investment_type: {
      type: GraphQLString,
    },
    announced_on: {
      type: GraphQLString,
    },
    raised_amount_usd: {
      type: GraphQLString,
    },
    raised_amount: {
      type: GraphQLString,
    },
    raised_amount_currency_code: {
      type: GraphQLString,
    },
    post_money_valuation_usd: {
      type: GraphQLString,
    },
    post_money_valuation: {
      type: GraphQLString,
    },
    post_money_valuation_currency_code: {
      type: GraphQLString,
    },
    investor_count: {
      type: GraphQLString,
    },
    org_uuid: {
      type: GraphQLString,
    },
    org_name: {
      type: GraphQLString,
    },
    lead_investor_uuids: {
      type: GraphQLString,
    },

    investment_partners: {
      type: new GraphQLList(InvestmentPartnerType),
      resolve(parent, args) {
        return DB.select()
          .from("investment_partners")
          .where("funding_round_uuid", parent.uuid);
      },
    },
    investments: {
      type: new GraphQLList(InvestmentType),
      resolve(parent, args) {
        return DB.select().from("investments").where("funding_round_uuid", parent.uuid);
      },
    },
  }),
});

const InvestmentPartnerType = new GraphQLObjectType({
  name: "InvestmentPartner",
  fields: () => ({
    uuid: {
      type: GraphQLString,
    },
    name: {
      type: GraphQLString,
    },
    type: {
      type: GraphQLString,
    },
    permalink: {
      type: GraphQLString,
    },
    cb_url: {
      type: GraphQLString,
    },
    rank: {
      type: GraphQLInt,
    },
    created_at: {
      type: GraphQLString,
    },
    updated_at: {
      type: GraphQLString,
    },
    funding_round_uuid: {
      type: GraphQLString,
    },
    funding_round_name: {
      type: GraphQLString,
    },
    investor_uuid: {
      type: GraphQLString,
    },
    investor_name: {
      type: GraphQLString,
    },
    partner_uuid: {
      type: GraphQLString,
    },
    partner_name: {
      type: GraphQLString,
    },
    investor: {
      type: InvestorType,
      resolve(parent, args) {
        return DB.select().from("investors").where("uuid", parent.investor_uuid).first();
      },
    },
  }),
});

const InvestmentType = new GraphQLObjectType({
  name: "Investment",
  fields: () => ({
    uuid: {
      type: GraphQLString,
    },
    name: {
      type: GraphQLString,
    },
    type: {
      type: GraphQLString,
    },
    permalink: {
      type: GraphQLString,
    },
    cb_url: {
      type: GraphQLString,
    },
    rank: {
      type: GraphQLInt,
    },
    created_at: {
      type: GraphQLString,
    },
    updated_at: {
      type: GraphQLString,
    },
    funding_round_uuid: {
      type: GraphQLString,
    },
    funding_round_name: {
      type: GraphQLString,
    },
    investor_uuid: {
      type: GraphQLString,
    },
    investor_name: {
      type: GraphQLString,
    },
    investor_type: {
      type: GraphQLString,
    },
    is_lead_investor: {
      type: GraphQLBoolean,
    },
    investor: {
      type: InvestorType,
      resolve(parent, args) {
        return DB.select().from("investors").where("uuid", parent.investor_uuid).first();
      },
    },
  }),
});

const InvestorType = new GraphQLObjectType({
  name: "InvestorType",
  fields: () => ({
    uuid: {
      type: GraphQLString,
    },
    name: {
      type: GraphQLString,
    },
    type: {
      type: GraphQLString,
    },
    permalink: {
      type: GraphQLString,
    },
    cb_url: {
      type: GraphQLString,
    },
    rank: {
      type: GraphQLInt,
    },
    created_at: {
      type: GraphQLString,
    },
    updated_at: {
      type: GraphQLString,
    },
    roles: {
      type: GraphQLString,
    },
    domain: {
      type: GraphQLString,
    },
    country_code: {
      type: GraphQLString,
    },
    state_code: {
      type: GraphQLString,
    },
    region: {
      type: GraphQLInt,
    },
    city: {
      type: GraphQLInt,
    },
    investor_types: {
      type: GraphQLString,
    },

    investment_count: {
      type: GraphQLString,
    },
    total_funding_usd: {
      type: GraphQLString,
    },
    total_funding: {
      type: GraphQLString,
    },
    total_funding_currency_code: {
      type: GraphQLString,
    },
    founded_on: {
      type: GraphQLString,
    },
    closed_on: {
      type: GraphQLString,
    },
    facebook_url: {
      type: GraphQLString,
    },
    linkedin_url: {
      type: GraphQLString,
    },
    twitter_url: {
      type: GraphQLString,
    },
    logo_url: {
      type: GraphQLString,
    },
  }),
});

const FundType = new GraphQLObjectType({
  name: "Fund",
  fields: () => ({
    uuid: {
      type: GraphQLString,
    },
    name: {
      type: GraphQLString,
    },
    type: {
      type: GraphQLString,
    },
    permalink: {
      type: GraphQLString,
    },
    cb_url: {
      type: GraphQLString,
    },
    rank: {
      type: GraphQLInt,
    },
    created_at: {
      type: GraphQLString,
    },
    updated_at: {
      type: GraphQLString,
    },
    entity_uuid: {
      type: GraphQLString,
    },
    entity_name: {
      type: GraphQLString,
    },
    entity_type: {
      type: GraphQLString,
    },
    announced_on: {
      type: GraphQLString,
    },
    raised_amount_usd: {
      type: GraphQLInt,
    },
    raised_amount: {
      type: GraphQLInt,
    },
    raised_amount_currency_code: {
      type: GraphQLString,
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    organization: {
      type: OrganizationType,
      args: { permalink: { type: GraphQLString } },
      async resolve(parent, { permalink }) {
        return await DB.select()
          .from("organizations")
          .where("permalink", permalink)
          .first();
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
