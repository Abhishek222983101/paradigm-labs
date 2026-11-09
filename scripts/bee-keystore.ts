// Builds a V3 keystore for the Bee node from SWARM_FUNDER_PRIVATE_KEY, encrypted with BEE_PASSWORD,
// and prints it base64-encoded for the BEE_SWARM_KEY_JSON Railway variable. Prints nothing else.
import { Wallet } from "ethers"

const w = new Wallet(process.env.SWARM_FUNDER_PRIVATE_KEY!)
const json = await w.encrypt(process.env.BEE_PASSWORD!)
process.stdout.write(Buffer.from(json).toString("base64"))
