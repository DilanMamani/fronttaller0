export const extractError = (actionOrError) => {
  try {
    if (actionOrError?.msg && !actionOrError?.meta) return actionOrError.msg;
    if (actionOrError && actionOrError.meta !== undefined) {
      const p = actionOrError.payload;

      if (p !== undefined) {
        if (typeof p === 'string') return p;

       if (p && typeof p === 'object') {
  if (p.data?.errors) {
    return Object.values(p.data.errors)
      .map(e => e?.msg || e?.message || e)
      .filter(Boolean)
      .join('\n');
  }

  if (p.message) return p.message;
  if (p.msg) return p.msg;

  if (p.errors) {
    if (Array.isArray(p.errors)) {
      return p.errors.map(e => e?.msg || e?.message || e).join('\n');
    }

    if (typeof p.errors === 'object') {
      return Object.values(p.errors)
        .map(e => e?.msg || e?.message || e)
        .filter(Boolean)
        .join('\n');
    }

    return String(p.errors);
  }

  if (p.error) return typeof p.error === 'string' ? p.error : JSON.stringify(p.error);
  if (p.detail) return typeof p.detail === 'string' ? p.detail : JSON.stringify(p.detail);

  return JSON.stringify(p);
}
      }

      if (actionOrError.error) {
        const ae = actionOrError.error;
        if (typeof ae === 'string') return ae;
        if (ae?.message) return ae.message;
      }
    }

    const e = actionOrError;

    if (e?.response?.data) {
      const d = e.response.data;

      if (typeof d === 'string') return d;
      if (d.message) return d.message;
      if (d.msg) return d.msg;
      if (d.error) return typeof d.error === 'string' ? d.error : JSON.stringify(d.error);
      if (d.errors) {
        if (Array.isArray(d.errors)) {
          return d.errors.map(x => x?.msg || x?.message || x).join('\n');
        }

        if (typeof d.errors === 'object') {
          return Object.values(d.errors)
            .map(x => x?.msg || x?.message || x)
            .filter(Boolean)
            .join('\n');
        }

        return String(d.errors);
      }
      if (d.detail) return typeof d.detail === 'string' ? d.detail : JSON.stringify(d.detail);

      return JSON.stringify(d);
    }

    if (e?.message) return e.message;

    return 'Error desconocido';
  } catch (ex) {
    return `Error inesperado: ${ex?.message || ex}`;
  }
};