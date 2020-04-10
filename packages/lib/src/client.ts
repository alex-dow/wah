import axios from 'axios';
import { ISession } from './models/session';

class ApiClient {
  private host: string;

  constructor (host: string) {
    this.host = host;
  }

  public async session (): Promise<ISession> {
    const res = await axios.get(this.host + 'session');
    if (res.status >= 400) {
      console.error(res.data);
      throw new Error('Failed to load session');
    }
    const session: ISession = res.data;
    return session;
  }
}

export default ApiClient;
