import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/authStore';

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const show = useCallback((msg: string, type: 'success' | 'error' = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);
  return { toast, show };
}

export function LoginScreen({ navigation, route }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast, show: showToast } = useToast();
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    if (route?.params?.successMsg) {
      showToast(route.params.successMsg, 'success');
      navigation.setParams({ successMsg: undefined });
    }
  }, [route?.params?.successMsg]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      showToast(err.response?.data?.message || '로그인에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {toast && (
        <View style={[styles.toast, toast.type === 'error' ? styles.toastError : styles.toastSuccess]}>
          <Text style={[styles.toastText, toast.type === 'error' ? styles.toastTextError : styles.toastTextSuccess]}>
            {toast.type === 'success' ? '✓ ' : '✕ '}{toast.msg}
          </Text>
        </View>
      )}
      <Text style={styles.title}>로그인</Text>
      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? '로그인 중...' : '로그인'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
        <Text style={styles.linkText}>계정이 없으신가요? 회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  toast: {
    position: 'absolute', top: 40, left: 16, right: 16,
    borderRadius: 10, padding: 12, zIndex: 100,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 6,
  },
  toastSuccess: { backgroundColor: '#e6f9ee' },
  toastError: { backgroundColor: '#fff0f0' },
  toastText: { fontSize: 14, textAlign: 'center' },
  toastTextSuccess: { color: '#1a7a3c' },
  toastTextError: { color: '#c0392b' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#FEE500', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 12 },
  disabled: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  link: { alignItems: 'center', marginTop: 8 },
  linkText: { color: '#888', fontSize: 14 },
});
