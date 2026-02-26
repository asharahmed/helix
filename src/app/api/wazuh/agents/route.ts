import { NextRequest, NextResponse } from 'next/server';
import { getWazuhAgents, triggerSyscheck, triggerRootcheck } from '@/lib/clients/wazuh';

export async function GET() {
  try {
    const data = await getWazuhAgents();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch agents' },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, agentId } = await req.json();

    if (!agentId || typeof agentId !== 'string' || agentId.length > 20) {
      return NextResponse.json({ error: 'Invalid agentId' }, { status: 400 });
    }

    let result;
    switch (action) {
      case 'syscheck':
        result = await triggerSyscheck(agentId);
        break;
      case 'rootcheck':
        result = await triggerRootcheck(agentId);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Action failed' },
      { status: 502 }
    );
  }
}
