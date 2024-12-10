import { User } from '../User.js'

export async function gracefullShutDown() {
  console.log('Gracefully shutting down...')
  await User.destroyAllMenus()
}
