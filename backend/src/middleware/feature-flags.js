import { Flagsmith } from 'flagsmith-nodejs';
console.log('FLAGSMITH_SERVER_KEY:', process.env.FLAGSMITH_SERVER_KEY);
const flagsmith = new Flagsmith({
  environmentKey: process.env.FLAGSMITH_SERVER_KEY,
});

export const getFeatureValue = async (flagName) => {
  if (!flagName) throw new Error('Flag name is required');
  const flags = await flagsmith.getEnvironmentFlags();
  return flags.getFeatureValue(flagName);
};

export default flagsmith;
