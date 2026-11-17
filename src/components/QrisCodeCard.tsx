import React from 'react';
import { formatIDR } from '../utils/format';

interface QrisCodeCardProps {
  total: number;
  orderCode?: string;
}

// Pola matriks QR deterministik 21x21 (Version 1) dengan finder pattern standar di 3 sudut
const QR_MATRIX: string[] = [
  '111111101011011111111',
  '100000100101001000001',
  '101110101110101011101',
  '101110100101101011101',
  '101110101011001011101',
  '100000101100101000001',
  '111111101010101111111',
  '000000001101000000000',
  '101101110010110101101',
  '010110001101001010010',
  '111011101011101101101',
  '001100010100110010110',
  '110101101110101110011',
  '000000001011010010101',
  '111111100101101011010',
  '100000101100100101101',
  '101110101011011100110',
  '101110100110101011001',
  '101110101101011001110',
  '100000100110100110011',
  '111111101001110101101',
];

export function QrisCodeCard({ total, orderCode }: QrisCodeCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-[#E4C3CF] p-4 text-center space-y-3">
      <div className="flex items-center justify-between text-xs border-b border-[#E4C3CF] pb-2">
        <span className="font-display font-bold text-[#362029]">
          QRIS · MiePetShop
        </span>
        <span className="tabular-nums font-medium text-[#5F424E]">
          NMID: ID1026048829103
        </span>
      </div>

      <div className="inline-flex p-3 rounded-2xl bg-white border border-[#E4C3CF] shadow-xs">
        <svg
          viewBox="0 0 21 21"
          className="w-36 h-36"
          role="img"
          aria-label="Kode QRIS Pembayaran MiePetShop"
          shapeRendering="crispEdges"
        >
          <rect width="21" height="21" fill="#FFFFFF" />
          {QR_MATRIX.map((row, y) =>
            row.split('').map((cell, x) =>
              cell === '1' ? (
                <rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width="1"
                  height="1"
                  fill="#362029"
                />
              ) : null
            )
          )}
        </svg>
      </div>

      <div className="space-y-0.5">
        <p className="text-xs text-[#5F424E]">
          Scan kode QRIS di atas melalui DANA, GoPay, OVO, ShopeePay, atau mobile banking
        </p>
        <p className="tabular-nums text-sm font-bold text-[#BA3360]">
          Nominal: {formatIDR(total)}
        </p>
        {orderCode && (
          <p className="text-xs text-[#5F424E]">
            Kode Pesanan: <strong className="text-[#362029]">{orderCode}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
