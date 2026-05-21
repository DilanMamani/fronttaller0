export const extractError = (actionOrError) => {
  try {
    if (actionOrError && actionOrError.meta !== undefined) {
      const p = actionOrError.payload;

      if (p !== undefined) {
        if (typeof p === 'string') return p;

        if (p && typeof p === 'object') {
          if (p.message) return p.message;
          if (p.msg) return p.msg;
          if (p.error) return typeof p.error === 'string' ? p.error : JSON.stringify(p.error);
          if (p.errors) return Array.isArray(p.errors)
            ? p.errors.map(e => e?.message || e).join(' | ')
            : JSON.stringify(p.errors);
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
      if (d.errors) return Array.isArray(d.errors)
        ? d.errors.map(x => x?.message || x).join(' | ')
        : JSON.stringify(d.errors);
      if (d.detail) return typeof d.detail === 'string' ? d.detail : JSON.stringify(d.detail);

      return JSON.stringify(d);
    }

    if (e?.message) return e.message;

    return 'Error desconocido';
  } catch (ex) {
    return `Error inesperado: ${ex?.message || ex}`;
  }
};