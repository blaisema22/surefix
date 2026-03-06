// backend/utils/llmSanitize.js
function sanitizePayload(payload, toolRegistrySet) {
  if (!payload || typeof payload !== 'object') return payload;
  try {
    // Remove single tool_result if its tool id isn't registered
    if (payload.tool_result && payload.tool_result.tool && payload.tool_result.tool.id) {
      const id = payload.tool_result.tool.id;
      if (!toolRegistrySet || !toolRegistrySet.has(id)) {
        delete payload.tool_result;
      }
    }

    // Sanitize array of tool_results
    if (Array.isArray(payload.tool_results)) {
      payload.tool_results = payload.tool_results.filter(tr => {
        if (!tr || !tr.tool || !tr.tool.id) return false;
        return !toolRegistrySet || toolRegistrySet.has(tr.tool.id);
      });
      if (payload.tool_results.length === 0) delete payload.tool_results;
    }

    // Also defensively remove any nested tool id references in choices or outputs
    // (best-effort, non-exhaustive)
    if (Array.isArray(payload.choices)) {
      payload.choices = payload.choices.map(c => {
        if (c && c.tool_result && c.tool_result.tool && c.tool_result.tool.id) {
          const id = c.tool_result.tool.id;
          if (!toolRegistrySet || !toolRegistrySet.has(id)) {
            const copy = Object.assign({}, c);
            delete copy.tool_result;
            return copy;
          }
        }
        return c;
      });
    }
  } catch (e) {
    // If sanitizer fails for any reason, return original payload to avoid hiding data.
    return payload;
  }
  return payload;
}

module.exports = { sanitizePayload };
