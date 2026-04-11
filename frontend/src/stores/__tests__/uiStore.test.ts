import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useUIStore } from '../uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.setState({
      toasts: [],
      isLoading: false,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('toasts', () => {
    it('starts with empty toasts array', () => {
      const { toasts } = useUIStore.getState();
      expect(toasts).toEqual([]);
    });

    it('adds a toast with correct properties', () => {
      const { addToast } = useUIStore.getState();

      addToast('success', 'Test message');

      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0]).toMatchObject({
        type: 'success',
        message: 'Test message',
      });
      expect(toasts[0].id).toBeTruthy();
    });

    it('adds multiple toasts', () => {
      const { addToast } = useUIStore.getState();

      addToast('success', 'First message');
      vi.advanceTimersByTime(10);
      addToast('error', 'Second message');
      vi.advanceTimersByTime(10);
      addToast('warning', 'Third message');

      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(3);
      expect(toasts[0].message).toBe('First message');
      expect(toasts[1].message).toBe('Second message');
      expect(toasts[2].message).toBe('Third message');
    });

    it('auto-removes toast after 5 seconds', () => {
      const { addToast } = useUIStore.getState();

      addToast('success', 'Auto remove test');

      const { toasts: initialToasts } = useUIStore.getState();
      expect(initialToasts).toHaveLength(1);

      // Fast-forward time by 5 seconds
      vi.advanceTimersByTime(5000);

      const { toasts: toastsAfterTimeout } = useUIStore.getState();
      expect(toastsAfterTimeout).toHaveLength(0);
    });

    it('supports all toast types', () => {
      const { addToast } = useUIStore.getState();

      addToast('success', 'Success');
      vi.advanceTimersByTime(10);
      addToast('error', 'Error');
      vi.advanceTimersByTime(10);
      addToast('info', 'Info');
      vi.advanceTimersByTime(10);
      addToast('warning', 'Warning');

      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(4);
      expect(toasts[0].type).toBe('success');
      expect(toasts[1].type).toBe('error');
      expect(toasts[2].type).toBe('info');
      expect(toasts[3].type).toBe('warning');
    });
  });

  describe('loading state', () => {
    it('starts with isLoading as false', () => {
      const { isLoading } = useUIStore.getState();
      expect(isLoading).toBe(false);
    });

    it('sets loading to true', () => {
      const { setLoading } = useUIStore.getState();

      setLoading(true);

      const { isLoading } = useUIStore.getState();
      expect(isLoading).toBe(true);
    });

    it('sets loading to false', () => {
      const { setLoading } = useUIStore.getState();

      setLoading(true);
      setLoading(false);

      const { isLoading } = useUIStore.getState();
      expect(isLoading).toBe(false);
    });

    it('toggles loading state multiple times', () => {
      const { setLoading } = useUIStore.getState();

      setLoading(true);
      expect(useUIStore.getState().isLoading).toBe(true);

      setLoading(false);
      expect(useUIStore.getState().isLoading).toBe(false);

      setLoading(true);
      expect(useUIStore.getState().isLoading).toBe(true);
    });
  });

  describe('integration', () => {
    it('maintains independent state for toasts and loading', () => {
      const { addToast, setLoading } = useUIStore.getState();

      setLoading(true);
      addToast('success', 'Test');

      const state = useUIStore.getState();
      expect(state.isLoading).toBe(true);
      expect(state.toasts).toHaveLength(1);

      setLoading(false);
      const newState = useUIStore.getState();
      expect(newState.isLoading).toBe(false);
      expect(newState.toasts).toHaveLength(1);
    });
  });
});
