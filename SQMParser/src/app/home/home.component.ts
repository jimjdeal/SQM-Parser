import { Component } from '@angular/core';
import * as FileSaver from 'file-saver';
import { isNullOrUndefined } from 'util';
import { ParserService } from '../parser/parser.service';
import { ASTMission } from '../shared/ast';

@Component( {
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: [ './home.component.css' ]
} )
export class HomeComponent {
  missionAST: ASTMission;

  fileReaderString: string;
  confirmed = false;
  loading = false;

  constructor( private parser: ParserService ) {}

  /**
   * Fired when a file has been selected by the user's $event
   * Based on:
   * https://www.academind.com/learn/angular/snippets/angular-image-upload-made-easy/ [Online] Accessed 9th October 2018
   * https://stackoverflow.com/a/27439524 [Online] Accessed 16th October 2018
   * https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html [Online] Accessed 17th October 2018
   */
  onFileChanged( fileChangeEvent: any ) {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.fileReaderString = fileReader.result as string;
    };
    fileReader.onerror = () => {
      fileReader.abort();
    };
    fileReader.onprogress = () => {
      this.loading = true;
    };
    fileReader.onloadend = (data) => {
      if (data.lengthComputable) {
        console.log(data.loaded);
        this.loading = false;
      }
    };
    try {
      fileReader.readAsText( fileChangeEvent.target.files[ 0 ] );
    } catch ( TypeError ) {
      console.log( 'error loading, type error' );
    }
  }

  /**
   * Fired when the user clicks the confirm button, main method
   */
  confirmSelection() {
    if ( !isNullOrUndefined( this.fileReaderString ) ) {
      this.confirmed = true;
      this.startTreeCreation();
    }
  }

  /**
   * Start AST tree creation
   */
  async startTreeCreation() {
    this.missionAST = this.parser.generateAST( this.fileReaderString.split( '\r\n') );
    console.log(this.missionAST);
    this.fileReaderString = undefined;
  }
}
