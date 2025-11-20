import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal } from './Modal';
import { Button } from './Button';
import { AppText } from './AppText';

type Props = {
  isOpen: boolean;
  title: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmationDialog({
  isOpen,
  title,
  description,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal isOpen={isOpen} transparent>
      <View className="w-full px-3">
        <View className="w-full max-w-md rounded-[24px] border border-white-500 bg-white-500/70 p-4">
          <AppText weight="bold" style={styles.title}>
            {title}
          </AppText>

          {description ? <AppText style={styles.description}>{description}</AppText> : null}

          <View className="mt-4 flex-row items-center justify-center gap-4">
            <Button
              variant="reallyLightGrey"
              radius="full"
              size="auto"
              style={styles.buttonFlex}
              className="h-[48px] px-[24px]"
              onPress={onCancel}>
              <AppText weight="medium" style={styles.cancelText}>
                {cancelText}
              </AppText>
            </Button>

            <Button
              variant="destructive"
              radius="full"
              size="auto"
              style={styles.buttonFlex}
              className="h-[48px] px-[24px]"
              onPress={onConfirm}>
              <AppText weight="medium" style={styles.confirmText}>
                {confirmText}
              </AppText>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    lineHeight: 28,
    textAlign: 'center',
    color: '#000',
    marginBottom: 16,
  },
  description: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    color: '#000',
    marginBottom: 6,
  },
  buttonFlex: {
    flex: 1,
  },
  cancelText: {
    color: '#5E349E',
    fontSize: 16,
    lineHeight: 20,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
  },
});
