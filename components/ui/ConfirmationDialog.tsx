import React from 'react';
import { View } from 'react-native';
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
      <View style={{ width: '100%', paddingHorizontal: 12 }}>
        <View
          style={{
            width: '100%',
            maxWidth: 360,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: '#FFFFFF',
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: 16,
          }}>
          <AppText
            weight="bold"
            style={{
              fontSize: 24,
              lineHeight: 28,
              textAlign: 'center',
              color: '#000',
              marginBottom: 16,
            }}>
            {title}
          </AppText>

          {description ? (
            <AppText
              style={{
                fontSize: 20,
                lineHeight: 24,
                textAlign: 'center',
                color: '#000',
                marginBottom: 6,
              }}>
              {description}
            </AppText>
          ) : null}

          <View
            style={{
              marginTop: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Button
              variant="reallyLightGrey"
              radius="full"
              size="auto"
              style={{ flex: 1, marginRight: 8, height: 48, paddingHorizontal: 24 }}
              onPress={onCancel}>
              <AppText weight="medium" style={{ color: '#5E349E', fontSize: 16, lineHeight: 20 }}>
                {cancelText}
              </AppText>
            </Button>

            <Button
              variant="destructive"
              radius="full"
              size="auto"
              style={{ flex: 1, marginLeft: 8, height: 48, paddingHorizontal: 24 }}
              onPress={onConfirm}>
              <AppText weight="medium" style={{ color: '#FFFFFF', fontSize: 16, lineHeight: 20 }}>
                {confirmText}
              </AppText>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// styles migrated to inline style props
