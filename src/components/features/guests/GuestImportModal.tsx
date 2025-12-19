import { useState, useCallback } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  usePreviewImport,
  useImportGuests,
  useDownloadTemplate,
  type ImportPreviewResponse,
} from '@/hooks/useGuests';

interface GuestImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onSuccess?: () => void;
}

type Step = 'upload' | 'preview' | 'result';

export function GuestImportModal({
  open,
  onOpenChange,
  eventId,
  onSuccess,
}: GuestImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [delimiter, setDelimiter] = useState(',');
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const { mutate: previewImport, isPending: isPreviewing } = usePreviewImport(eventId);
  const { mutate: importGuests, isPending: isImporting } = useImportGuests(eventId);
  const { mutate: downloadTemplate, isPending: isDownloading } = useDownloadTemplate();

  const resetState = useCallback(() => {
    setStep('upload');
    setFile(null);
    setPreview(null);
    setImportResult(null);
    setDelimiter(',');
    setSkipDuplicates(true);
  }, []);

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const ext = droppedFile.name.toLowerCase().slice(droppedFile.name.lastIndexOf('.'));
      if (validExtensions.includes(ext)) {
        setFile(droppedFile);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handlePreview = () => {
    if (!file) return;

    previewImport(
      { file, delimiter },
      {
        onSuccess: (data) => {
          setPreview(data);
          setStep('preview');
        },
      }
    );
  };

  const handleImport = () => {
    if (!file) return;

    importGuests(
      { file, skipDuplicates, delimiter },
      {
        onSuccess: (data) => {
          setImportResult(data.data);
          setStep('result');
          onSuccess?.();
        },
      }
    );
  };

  const handleDownloadTemplate = () => {
    downloadTemplate('csv');
  };

  const duplicateCount = preview?.rows.filter((r) => r.is_duplicate).length || 0;
  const validCount = (preview?.rows.length || 0) - duplicateCount;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importer des invites
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Importez une liste d\'invites depuis un fichier CSV ou Excel.'}
            {step === 'preview' && 'Verifiez les donnees avant de confirmer l\'import.'}
            {step === 'result' && 'Resultat de l\'import.'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 py-2">
          <div className={cn('flex items-center gap-1', step === 'upload' ? 'text-primary' : 'text-muted-foreground')}>
            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs', step === 'upload' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>1</div>
            <span className="text-sm">Upload</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={cn('flex items-center gap-1', step === 'preview' ? 'text-primary' : 'text-muted-foreground')}>
            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs', step === 'preview' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>2</div>
            <span className="text-sm">Preview</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={cn('flex items-center gap-1', step === 'result' ? 'text-primary' : 'text-muted-foreground')}>
            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs', step === 'result' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>3</div>
            <span className="text-sm">Resultat</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              {/* Download template */}
              <Alert>
                <Download className="h-4 w-4" />
                <AlertTitle>Template disponible</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                  <span>Telechargez le modele pour formater correctement vos donnees.</span>
                  <Button variant="outline" size="sm" onClick={handleDownloadTemplate} disabled={isDownloading}>
                    <Download className="mr-2 h-4 w-4" />
                    Telecharger le template
                  </Button>
                </AlertDescription>
              </Alert>

              {/* Drop zone */}
              <div
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
                  isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                )}
              >
                <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-lg font-medium">Glissez-deposez votre fichier ici</p>
                <p className="text-sm text-muted-foreground mb-4">ou</p>
                <label>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="sr-only"
                  />
                  <Button type="button" variant="outline" asChild>
                    <span>Parcourir</span>
                  </Button>
                </label>
                <p className="mt-4 text-xs text-muted-foreground">
                  Formats acceptes: CSV, Excel (.xlsx, .xls)
                </p>
              </div>

              {/* Selected file */}
              {file && (
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)} Ko)
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Delimiteur CSV</Label>
                  <Select value={delimiter} onValueChange={setDelimiter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=",">Virgule (,)</SelectItem>
                      <SelectItem value=";">Point-virgule (;)</SelectItem>
                      <SelectItem value="\t">Tabulation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <div className="flex items-center space-x-2 h-10">
                    <Checkbox
                      id="skipDuplicates"
                      checked={skipDuplicates}
                      onCheckedChange={(checked) => setSkipDuplicates(checked as boolean)}
                    />
                    <Label htmlFor="skipDuplicates" className="cursor-pointer">
                      Ignorer les doublons
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && preview && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-md border p-3 text-center">
                  <p className="text-2xl font-bold">{preview.total_rows}</p>
                  <p className="text-sm text-muted-foreground">Total lignes</p>
                </div>
                <div className="rounded-md border p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{validCount}</p>
                  <p className="text-sm text-muted-foreground">A importer</p>
                </div>
                <div className="rounded-md border p-3 text-center">
                  <p className="text-2xl font-bold text-orange-600">{duplicateCount}</p>
                  <p className="text-sm text-muted-foreground">Doublons</p>
                </div>
              </div>

              {/* Errors */}
              {preview.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreurs detectees</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {preview.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview table */}
              <ScrollArea className="h-[300px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Statut</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telephone</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.rows.slice(0, 50).map((row, index) => (
                      <TableRow key={index} className={row.is_duplicate ? 'bg-orange-50 dark:bg-orange-950/20' : ''}>
                        <TableCell>
                          {row.is_duplicate ? (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              Doublon
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Nouveau
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{row.name || '-'}</TableCell>
                        <TableCell>{row.email || '-'}</TableCell>
                        <TableCell>{row.phone || '-'}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{row.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              {preview.total_rows > 50 && (
                <p className="text-sm text-muted-foreground text-center">
                  Affichage de 50 sur {preview.total_rows} lignes
                </p>
              )}
            </div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && importResult && (
            <div className="space-y-4">
              <Alert variant={importResult.errors.length > 0 ? 'default' : 'default'} className="border-green-500">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Import termine</AlertTitle>
                <AlertDescription>
                  {importResult.imported} invite(s) importe(s) avec succes.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-md border p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{importResult.imported}</p>
                  <p className="text-sm text-muted-foreground">Importes</p>
                </div>
                <div className="rounded-md border p-4 text-center">
                  <p className="text-3xl font-bold text-orange-600">{importResult.skipped}</p>
                  <p className="text-sm text-muted-foreground">Ignores</p>
                </div>
                <div className="rounded-md border p-4 text-center">
                  <p className="text-3xl font-bold text-red-600">{importResult.errors.length}</p>
                  <p className="text-sm text-muted-foreground">Erreurs</p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreurs durant l'import</AlertTitle>
                  <AlertDescription>
                    <ScrollArea className="h-[150px]">
                      <ul className="list-disc list-inside">
                        {importResult.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-4 border-t">
          <div>
            {step !== 'upload' && step !== 'result' && (
              <Button variant="outline" onClick={() => setStep('upload')}>
                Retour
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              {step === 'result' ? 'Fermer' : 'Annuler'}
            </Button>
            {step === 'upload' && (
              <Button onClick={handlePreview} disabled={!file || isPreviewing}>
                {isPreviewing ? 'Analyse en cours...' : 'Verifier'}
              </Button>
            )}
            {step === 'preview' && (
              <Button onClick={handleImport} disabled={isImporting || validCount === 0}>
                {isImporting ? (
                  <>
                    <Progress className="w-16 h-2 mr-2" value={50} />
                    Import en cours...
                  </>
                ) : (
                  `Importer ${validCount} invite(s)`
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
