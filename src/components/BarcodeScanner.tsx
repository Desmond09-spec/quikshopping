import React, { useEffect } from 'react';
import {
    BarcodeScanner as CapacitorBarcodeScanner,
    BarcodeFormat,
    LensFacing
} from '@capacitor-mlkit/barcode-scanning';
import { useToast } from '@/hooks/use-toast';

interface BarcodeScannerProps {
    onScan: (result: string) => void;
    onClose: () => void;
    formats?: BarcodeFormat[];
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
    onScan,
    onClose,
    formats = [
        BarcodeFormat.QrCode,
        BarcodeFormat.Ean13,
        BarcodeFormat.Ean8,
        BarcodeFormat.UpcA,
        BarcodeFormat.UpcE,
        BarcodeFormat.Code128,
        BarcodeFormat.Code39,
        BarcodeFormat.Code93
    ]
}) => {
    const { toast } = useToast();

    useEffect(() => {
        const startScanning = async () => {
            try {
                // Check permissions first
                const { camera } = await CapacitorBarcodeScanner.checkPermissions();

                if (camera !== 'granted') {
                    const { camera: newStatus } = await CapacitorBarcodeScanner.requestPermissions();

                    if (newStatus !== 'granted') {
                        toast({
                            title: "Permission Denied",
                            description: "Camera permission is required to scan barcodes.",
                            variant: "destructive"
                        });
                        onClose();
                        return;
                    }
                }

                // Start scanning with native UI
                const result = await CapacitorBarcodeScanner.scan({
                    formats: formats,
                    lensFacing: LensFacing.Back
                });

                // Handle scan result
                if (result.barcodes && result.barcodes.length > 0) {
                    const barcodeValue = result.barcodes[0].rawValue;
                    if (barcodeValue) {
                        onScan(barcodeValue);
                    } else {
                        toast({
                            title: "Scan Failed",
                            description: "Could not read barcode value.",
                            variant: "destructive"
                        });
                        onClose();
                    }
                } else {
                    // User cancelled or no barcode found
                    onClose();
                }
            } catch (error: any) {
                console.error('Barcode scanning error:', error);

                // Don't show error toast if user just cancelled
                if (error.message && !error.message.includes('cancel')) {
                    toast({
                        title: "Scan Error",
                        description: error.message || "Failed to scan barcode.",
                        variant: "destructive"
                    });
                }

                onClose();
            }
        };

        startScanning();

        // Cleanup - though scan() handles this automatically
        return () => {
            CapacitorBarcodeScanner.stopScan().catch(() => {
                // Ignore errors on cleanup
            });
        };
    }, [formats, onScan, onClose, toast]);

    // This component doesn't render anything visible - the native scanner UI is shown by the plugin
    return null;
};

export default BarcodeScanner;
