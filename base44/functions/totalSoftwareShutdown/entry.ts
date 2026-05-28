import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const entitiesToPurge = [
      'Notification',
      'Appointment',
      'Banner',
      'NurseInteraction',
      'AICreation',
      'Product',
      'BeautyTeaEvent',
      'ChatHistory',
      'PurchaseTicket',
      'PlatformRevenue',
      'RevenueShare',
      'Wallet',
      'ServiceRequest',
      'PlatformProduct',
      'PlatformSettings',
      'PageBlock',
      'UserProfile'
    ];

    const results = [];

    for (const entityName of entitiesToPurge) {
      const listResponse = await base44.asServiceRole.entities[entityName].list({ limit: 1000 });
      const records = listResponse?.data || [];

      for (const record of records) {
        await base44.asServiceRole.entities[entityName].delete(record.id);
      }

      results.push({ entity: entityName, deleted: records.length });
    }

    return Response.json({
      success: true,
      executed_at: new Date().toISOString(),
      results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});