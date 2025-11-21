import { Modal as RNModal, ModalProps, KeyboardAvoidingView, View, Platform } from 'react-native';

type PROPS = ModalProps & {
  isOpen: boolean;
  withInput?: boolean;
};

export const Modal = ({ isOpen, withInput, children, ...rest }: PROPS) => {
  const content = withInput ? (
    <KeyboardAvoidingView
      className="flex-1 items-center justify-center bg-zinc-900/80 px-3"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {children}
    </KeyboardAvoidingView>
  ) : (
    <View className="flex-1 items-center justify-center bg-zinc-900/80 px-3">{children}</View>
  );
  return (
    <RNModal visible={isOpen} transparent animationType="fade" statusBarTranslucent {...rest}>
      {content}
    </RNModal>
  );
};
